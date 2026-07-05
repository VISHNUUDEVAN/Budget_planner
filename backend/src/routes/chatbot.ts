import { Router, Response, NextFunction } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const CHECKLISTS: Record<string, string[]> = {
  student: ['College Fees', 'Hostel Fees', 'Mess', 'Transport', 'Books', 'Internet', 'Mobile Recharge', 'Entertainment', 'Personal Expenses'],
  family: ['Rent', 'School Fees', 'Groceries', 'Medical', 'Electricity', 'Water', 'Internet', 'Gas', 'Entertainment'],
  working_professional: ['Rent', 'EMI', 'Fuel', 'Groceries', 'Insurance', 'Bills', 'Investments', 'Transport', 'Dining'],
  bachelor: ['Rent', 'Groceries', 'Utilities', 'Transport', 'Entertainment', 'Dining Out', 'Personal Expenses'],
  business_owner: ['Office Rent', 'Employee Salary', 'Internet', 'Marketing', 'Inventory', 'GST', 'Transport', 'Utilities'],
  freelancer: ['Software', 'Internet', 'Equipment', 'Client Travel', 'Taxes'],
  job_seeker: ['Rent', 'Utilities', 'Groceries', 'Transport', 'Mobile Recharge', 'Internet', 'Interview Prep'],
  retired: ['Rent', 'Medical', 'Groceries', 'Electricity', 'Water', 'Internet', 'Gas', 'Entertainment', 'Charity'],
  default: ['Rent', 'Groceries', 'Utilities', 'Transport', 'Entertainment', 'Medical', 'Other']
};

interface ChatState {
  stage: 'onboarding' | 'idle';
  categories: string[];
  categoryIndex: number;
  currentCategory: string;
  awaitingAmount: boolean;
}

// Helper to get lifestyle checklist
function getChecklist(lifestyle: string | null | undefined): string[] {
  if (!lifestyle) return CHECKLISTS.default;
  const normalized = lifestyle.toLowerCase();
  return CHECKLISTS[normalized] || CHECKLISTS.default;
}

// Helper to save a message in db
async function saveMessage(userId: string, sender: 'ai' | 'user', text: string) {
  return prisma.chatMessage.create({
    data: {
      userId,
      sender,
      text
    }
  });
}

// ─── GET /chatbot/history ─────────────────────────────────────
router.get('/history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;

    let messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' }
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, lifestyleType: true, chatState: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // If empty history, initialize onboarding
    if (messages.length === 0) {
      const lifestyle = user.lifestyleType || 'student';
      const categories = getChecklist(lifestyle);
      
      const welcomeText = `Hello ${user.fullName}! Welcome. I will help you create your budget for your ${lifestyle.replace('_', ' ')} lifestyle. Let's go through your regular expenses. Do you have ${categories[0]} expenses? (Reply with a number, 'yes' to configure, or 'no' to skip)`;
      
      const initialMessage = await saveMessage(userId, 'ai', welcomeText);
      messages = [initialMessage];

      const initialState: ChatState = {
        stage: 'onboarding',
        categories,
        categoryIndex: 0,
        currentCategory: categories[0],
        awaitingAmount: false
      };

      await prisma.user.update({
        where: { id: userId },
        data: { chatState: JSON.stringify(initialState) }
      });
    }

    res.json({ success: true, data: { messages } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /chatbot/message ─────────────────────────────────────
router.post('/message', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, error: 'Message text is required' });
    }

    const cleanedText = text.trim();
    await saveMessage(userId, 'user', cleanedText);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { fullName: true, lifestyleType: true, chatState: true }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    let state: ChatState;
    if (user.chatState) {
      try {
        state = JSON.parse(user.chatState);
      } catch {
        const categories = getChecklist(user.lifestyleType);
        state = {
          stage: 'onboarding',
          categories,
          categoryIndex: 0,
          currentCategory: categories[0],
          awaitingAmount: false
        };
      }
    } else {
      const categories = getChecklist(user.lifestyleType);
      state = {
        stage: 'onboarding',
        categories,
        categoryIndex: 0,
        currentCategory: categories[0],
        awaitingAmount: false
      };
    }

    let responseText = '';
    const lowercaseText = cleanedText.toLowerCase();

    // Check for Restart command
    if (lowercaseText === 'restart' || lowercaseText === 'reset') {
      await prisma.chatMessage.deleteMany({ where: { userId } });
      const categories = getChecklist(user.lifestyleType);
      
      const welcomeText = `Hello ${user.fullName}! Welcome. Let's restart your budget configuration. Do you have ${categories[0]} expenses?`;
      const initialMessage = await saveMessage(userId, 'ai', welcomeText);
      
      const resetState: ChatState = {
        stage: 'onboarding',
        categories,
        categoryIndex: 0,
        currentCategory: categories[0],
        awaitingAmount: false
      };

      await prisma.user.update({
        where: { id: userId },
        data: { chatState: JSON.stringify(resetState) }
      });

      return res.json({ success: true, data: { message: initialMessage } });
    }

    // STATE MACHINE
    if (state.stage === 'onboarding') {
      const categories = state.categories;
      const index = state.categoryIndex;
      const currentCat = state.currentCategory || categories[index];

      if (state.awaitingAmount) {
        // User is replying with amount for a custom or prompt category
        const amount = parseFloat(cleanedText.replace(/[^0-9.]/g, ''));
        if (!isNaN(amount) && amount > 0) {
          // Save transaction
          await prisma.transaction.create({
            data: {
              userId,
              category: currentCat,
              amount,
              type: 'expense',
              note: 'Collected by AI Chatbot'
            }
          });

          responseText = `Got it! ₹${amount} saved for ${currentCat}. `;
          state.categoryIndex++;
          state.awaitingAmount = false;

          if (state.categoryIndex < categories.length) {
            const nextCat = categories[state.categoryIndex];
            state.currentCategory = nextCat;
            responseText += `Any ${nextCat} expenses? (Reply with a number, 'yes', or 'no')`;
          } else {
            state.stage = 'idle';
            responseText += `Excellent! I have collected all your regular expenses and saved them to your account. You can view them on the dashboard now. Feel free to ask me to add, edit, or delete any expenses anytime!`;
          }
        } else if (lowercaseText === 'no' || lowercaseText === 'none' || lowercaseText === 'skip') {
          responseText = `Skipped ${currentCat}. `;
          state.categoryIndex++;
          state.awaitingAmount = false;

          if (state.categoryIndex < categories.length) {
            const nextCat = categories[state.categoryIndex];
            state.currentCategory = nextCat;
            responseText += `Any ${nextCat} expenses?`;
          } else {
            state.stage = 'idle';
            responseText += `Excellent! I have collected all your regular expenses and saved them to your account. You can view them on the dashboard now. Feel free to ask me to add, edit, or delete any expenses anytime!`;
          }
        } else {
          responseText = `Please enter a valid amount for ${currentCat} (e.g. 500) or reply 'no' to skip.`;
        }
      } else {
        // We asked "Any Category expenses?"
        const amount = parseFloat(cleanedText.replace(/[^0-9.]/g, ''));
        
        if (!isNaN(amount) && amount > 0) {
          // User gave a number directly
          await prisma.transaction.create({
            data: {
              userId,
              category: currentCat,
              amount,
              type: 'expense',
              note: 'Collected by AI Chatbot'
            }
          });

          responseText = `Recorded ₹${amount} for ${currentCat}. `;
          state.categoryIndex++;
          
          if (state.categoryIndex < categories.length) {
            const nextCat = categories[state.categoryIndex];
            state.currentCategory = nextCat;
            responseText += `Any ${nextCat} expenses?`;
          } else {
            state.stage = 'idle';
            responseText += `Excellent! I have collected all your regular expenses and saved them to your account. You can view them on the dashboard now. Feel free to ask me to add, edit, or delete any expenses anytime!`;
          }
        } else if (lowercaseText === 'yes' || lowercaseText === 'yeah' || lowercaseText === 'y') {
          state.awaitingAmount = true;
          responseText = `How much do you spend per month on ${currentCat}?`;
        } else if (lowercaseText === 'no' || lowercaseText === 'none' || lowercaseText === 'skip' || lowercaseText === 'n') {
          responseText = `Skipped ${currentCat}. `;
          state.categoryIndex++;

          if (state.categoryIndex < categories.length) {
            const nextCat = categories[state.categoryIndex];
            state.currentCategory = nextCat;
            responseText += `Any ${nextCat} expenses?`;
          } else {
            state.stage = 'idle';
            responseText += `Excellent! I have collected all your regular expenses and saved them to your account. You can view them on the dashboard now. Feel free to ask me to add, edit, or delete any expenses anytime!`;
          }
        } else {
          // Assume user is entering a custom category name
          state.currentCategory = cleanedText;
          state.awaitingAmount = true;
          responseText = `How much do you spend per month on ${cleanedText}?`;
        }
      }
    } else {
      // IDLE STAGE — processes commands
      if (lowercaseText.startsWith('add') || lowercaseText.startsWith('spend') || lowercaseText.startsWith('spent')) {
        const words = lowercaseText.split(' ');
        const amount = parseFloat(cleanedText.replace(/[^0-9.]/g, ''));
        
        if (!isNaN(amount) && amount > 0) {
          const catWords = words.filter(w => 
            w !== 'add' && w !== 'spend' && w !== 'spent' && w !== 'income' && w !== 'expense' &&
            isNaN(parseFloat(w.replace(/[^0-9.]/g, '')))
          );
          const category = catWords.join(' ') || 'Other';
          const isIncome = lowercaseText.includes('income') || lowercaseText.includes('salary') || lowercaseText.includes('earned');
          
          await prisma.transaction.create({
            data: {
              userId,
              category: category.charAt(0).toUpperCase() + category.slice(1),
              amount,
              type: isIncome ? 'income' : 'expense',
              note: 'Logged via AI Chatbot'
            }
          });

          responseText = `Successfully added ${isIncome ? 'income' : 'expense'} for ${category} of ₹${amount}.`;
        } else {
          responseText = `To add an expense, type 'add [category] [amount]' (e.g. 'add food 300').`;
        }
      } else if (lowercaseText.startsWith('delete') || lowercaseText.startsWith('remove')) {
        const category = cleanedText.replace(/delete|remove/gi, '').trim();
        if (category) {
          const deleteResult = await prisma.transaction.deleteMany({
            where: {
              userId,
              category: { equals: category, mode: 'insensitive' }
            }
          });

          if (deleteResult.count > 0) {
            responseText = `Deleted all transactions (${deleteResult.count}) under category "${category}".`;
          } else {
            responseText = `No transactions found under category "${category}".`;
          }
        } else {
          responseText = `To delete transactions, type 'delete [category]' (e.g. 'delete food').`;
        }
      } else if (lowercaseText.includes('list') || lowercaseText.includes('show') || lowercaseText.includes('expenses')) {
        const transactions = await prisma.transaction.findMany({
          where: { userId },
          orderBy: { date: 'desc' },
          take: 10
        });

        if (transactions.length === 0) {
          responseText = `You don't have any logged transactions yet. Type 'add food 500' to record one!`;
        } else {
          responseText = `Here are your recent transactions:\n` + transactions.map(t => 
            `- ${t.category}: ${t.type === 'income' ? '+' : '-'} ₹${t.amount.toLocaleString('en-IN')} (${new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })})`
          ).join('\n');
        }
      } else {
        responseText = `I am your AI budget assistant. Try these commands:
- 'add [category] [amount]' (e.g. 'add groceries 1200')
- 'add income [category] [amount]' (e.g. 'add income salary 40000')
- 'delete [category]' (e.g. 'delete food')
- 'list' (shows recent transactions)
- 'restart' (restarts the onboarding budget setup)`;
      }
    }

    const aiMessage = await saveMessage(userId, 'ai', responseText);
    await prisma.user.update({
      where: { id: userId },
      data: { chatState: JSON.stringify(state) }
    });

    res.json({ success: true, data: { message: aiMessage } });
  } catch (err) {
    next(err);
  }
});

// ─── POST /chatbot/clear ───────────────────────────────────────
router.post('/clear', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    await prisma.chatMessage.deleteMany({ where: { userId } });
    await prisma.user.update({
      where: { id: userId },
      data: { chatState: null }
    });
    res.json({ success: true, data: { message: 'Chat history cleared successfully' } });
  } catch (err) {
    next(err);
  }
});

export default router;

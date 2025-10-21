import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/services/auth';
import { analyzeInventory, askQuestion } from '@/services/gemini';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!['SUPERVISOR', 'MANAGER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { type, data, question } = body;

    if (type === 'analyze') {
      const insights = await analyzeInventory(data);
      return NextResponse.json(insights);
    }

    if (type === 'question' && question) {
      const answer = await askQuestion(question, data);
      return NextResponse.json({ answer });
    }

    return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('AI insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

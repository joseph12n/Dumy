/**
 * LLM Prompt templates for Dumy financial chatbot
 * All prompts in Spanish (Colombian context)
 */

import { FinancialContext } from '../store/types';
import { formatCOP } from '../utils/currency';

export const SYSTEM_PROMPT = `Eres Dumy, un asistente financiero personal amigable y empático.
Ayudas a jóvenes colombianos a entender y mejorar sus finanzas personales.
Usas pesos colombianos (COP) y conoces el contexto económico de Colombia.
Eres conciso, claro, y siempre positivo. No das consejos de inversión formales ni garantías.
Respondes siempre en español colombiano informal pero respetuoso.
Cuando mencionas valores, siempre usas el formato colombiano: $ 150.000 COP.
Tu objetivo es educar y motivar al usuario a tomar mejores decisiones financieras.`;

/**
 * Build the financial context block that goes into the system prompt
 * Formats current financial data in a readable way for the LLM
 */
export function buildSystemContextBlock(context: FinancialContext): string {
  const { currentMonthSummary, recentTransactions, budgetAlerts, userName } = context;

  let block = `\n=== CONTEXTO FINANCIERO ACTUAL ===\n`;

  if (userName) {
    block += `Usuario: ${userName}\n`;
  }

  block += `\nResumen del mes actual:\n`;
  block += `- Ingresos: ${formatCOP(currentMonthSummary.totalIncome)}\n`;
  block += `- Gastos: ${formatCOP(currentMonthSummary.totalExpense)}\n`;
  block += `- Balance: ${formatCOP(currentMonthSummary.balance)}\n`;

  block += `\nCategorías de mayor gasto:\n`;
  for (const cat of currentMonthSummary.topCategories) {
    block += `- ${cat.name}: ${formatCOP(cat.amount)} (${cat.percentage.toFixed(1)}%)\n`;
  }

  if (recentTransactions.length > 0) {
    block += `\nÚltimas transacciones:\n`;
    for (const tx of recentTransactions.slice(0, 5)) {
      const sign = tx.type === 'income' ? '+' : '-';
      block += `- ${tx.date}: ${tx.description} [${sign}${formatCOP(tx.amount)}] (${tx.categoryName})\n`;
    }
  }

  if (budgetAlerts.length > 0) {
    block += `\nAlertas de presupuesto:\n`;
    for (const alert of budgetAlerts) {
      const status = alert.isOverBudget ? '⚠️ EXCEDIDO' : `${alert.percentageUsed.toFixed(0)}% utilizado`;
      block += `- ${alert.categoryName}: ${status}\n`;
    }
  }

  block += `\n================================\n`;

  return block;
}

/**
 * Build full prompt for LLM in Llama 3.2 instruction format
 * Combines system prompt, context, conversation history, and current user message
 */
export function buildFullPrompt(
  systemPrompt: string,
  context: FinancialContext,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  userMessage: string,
): string {
  const contextBlock = buildSystemContextBlock(context);

  // Llama 3.2 instruction format
  let prompt = `<|system|>\n${systemPrompt}${contextBlock}<|end|>\n`;

  // Add conversation history
  for (const msg of conversationHistory) {
    const role = msg.role === 'user' ? '<|user|>' : '<|assistant|>';
    prompt += `${role}\n${msg.content}<|end|>\n`;
  }

  // Add current user message and prompt for response
  prompt += `<|user|>\n${userMessage}<|end|>\n<|assistant|>\n`;

  return prompt;
}

/**
 * Strip formatting tags from LLM response
 * Remove any remaining tags that might appear in the output
 */
export function cleanLLMResponse(response: string): string {
  return response
    .replace(/<\|[^|]*\|>/g, '') // Remove any remaining tags
    .trim();
}

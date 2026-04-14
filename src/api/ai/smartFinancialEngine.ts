/**
 * Dumy Skill Engine — Bot local con skills integradas.
 *
 * Sistema de skills que analiza datos financieros reales del usuario
 * y genera respuestas útiles, tips de ahorro, recomendaciones y alertas.
 * Todo funciona offline, sin conexión a internet.
 *
 * Skills disponibles:
 *  - spending_overview: Resumen de gastos e ingresos del mes
 *  - category_analysis: Desglose por categorías
 *  - budget_check: Estado de presupuestos y alertas
 *  - savings_tips: Tips de ahorro personalizados basados en datos reales
 *  - daily_recommendations: Recomendaciones diarias según perfil
 *  - receipt_analysis: Análisis detallado de recibos escaneados
 *  - number_sum: Suma de números detectados en imágenes
 *  - trend_analysis: Tendencias y comparaciones
 *  - smart_alert: Alertas proactivas inteligentes
 *  - greeting: Saludo personalizado con resumen
 *  - help: Capacidades del sistema
 */

import { FinancialContext, ReceiptData } from "../../store/types";
import { formatCOP } from "../../utils/currency";

/* ------------------------------------------------------------------ */
/*  Skill types                                                       */
/* ------------------------------------------------------------------ */

type Skill =
  | "spending_overview"
  | "category_analysis"
  | "budget_check"
  | "savings_tips"
  | "daily_recommendations"
  | "receipt_analysis"
  | "number_sum"
  | "trend_analysis"
  | "smart_alert"
  | "greeting"
  | "help"
  | "general";

const SKILL_KEYWORDS: Record<Skill, string[]> = {
  spending_overview: [
    "gasto", "gastos", "cuanto llevo", "cuanto he gastado", "resumen",
    "como van", "como voy", "balance", "mes", "cuanto tengo",
    "estado financiero", "mis finanzas",
  ],
  category_analysis: [
    "categoria", "categorias", "donde gasto", "en que gasto", "mas gasto",
    "mayor gasto", "top", "distribucion", "desglose",
  ],
  budget_check: [
    "presupuesto", "limite", "excedido", "sobrepaso", "tope",
    "cuanto me queda", "falta", "budget",
  ],
  savings_tips: [
    "ahorro", "ahorrar", "consejo", "tip", "tips", "mejorar", "reducir",
    "recortar", "optimizar", "como ahorro", "quiero ahorrar",
    "estrategia", "meta de ahorro",
  ],
  daily_recommendations: [
    "recomendacion", "recomendaciones", "que me recomiendas", "sugerencia",
    "sugerencias", "que hago", "que deberia", "ayudame", "guia",
    "plan", "consejo del dia", "tip del dia",
  ],
  receipt_analysis: [
    "factura", "recibo", "ticket", "escaneo", "escaneado", "imagen",
    "foto", "total del recibo", "analiza el recibo", "que dice",
  ],
  number_sum: [
    "suma", "sumar", "total", "cuanto da", "cuanto es", "sumame",
    "suma los numeros", "resultado", "calcular", "calcula",
  ],
  trend_analysis: [
    "tendencia", "comparar", "anterior", "semana pasada", "mes pasado",
    "subi", "bajo", "aumento", "incremento", "progreso",
  ],
  smart_alert: [
    "alerta", "alertas", "aviso", "avisos", "cuidado", "peligro",
    "riesgo", "atencion", "problemas",
  ],
  greeting: [
    "hola", "hey", "buenas", "buenos", "que tal", "como estas",
    "holi", "ey", "saludos",
  ],
  help: [
    "que puedes hacer", "ayuda", "funciones", "sistema", "app",
    "como funciona", "skills", "habilidades", "capacidades",
    "que sabes hacer", "menu",
  ],
  general: [],
};

function classifySkill(message: string, hasReceipt: boolean): Skill {
  const lower = message.toLowerCase();

  // If there's a receipt and the message is generic, default to receipt_analysis
  if (hasReceipt && lower.length < 30) {
    const sumWords = ["suma", "sumar", "sumame", "total", "cuanto da"];
    if (sumWords.some((w) => lower.includes(w))) return "number_sum";
    return "receipt_analysis";
  }

  let bestSkill: Skill = "general";
  let bestScore = 0;

  for (const [skill, keywords] of Object.entries(SKILL_KEYWORDS) as Array<
    [Skill, string[]]
  >) {
    const score = keywords.filter((k) => lower.includes(k)).length;
    if (score > bestScore) {
      bestScore = score;
      bestSkill = skill;
    }
  }

  return bestSkill;
}

/* ------------------------------------------------------------------ */
/*  Utility helpers                                                   */
/* ------------------------------------------------------------------ */

function getDayOfMonth(): number {
  return new Date().getDate();
}

function getDaysInMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function getDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos dias";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
}

/* ------------------------------------------------------------------ */
/*  Skill: Spending Overview                                          */
/* ------------------------------------------------------------------ */

function skillSpendingOverview(ctx: FinancialContext): string {
  const { totalIncome, totalExpense, balance } = ctx.currentMonthSummary;

  if (totalIncome === 0 && totalExpense === 0) {
    return (
      "Aun no tienes transacciones registradas este mes. " +
      "Agrega tu primer ingreso o gasto para que pueda darte un panorama real.\n\n" +
      "Tip: Puedes escanear un recibo con la camara o agregar transacciones manualmente."
    );
  }

  const day = getDayOfMonth();
  const daysInMonth = getDaysInMonth();
  const daysLeft = daysInMonth - day;
  const dailyAvg = day > 0 ? Math.round(totalExpense / day) : 0;
  const projected = Math.round(dailyAvg * daysInMonth);

  const ratio =
    totalIncome > 0 ? ((totalExpense / totalIncome) * 100).toFixed(0) : "N/A";
  const status =
    balance >= 0
      ? "vas bien, estas en positivo!"
      : "ojo, estas gastando mas de lo que ingresas.";

  let response =
    `📊 *Resumen del mes (dia ${day} de ${daysInMonth})*\n\n` +
    `Ingresos: ${formatCOP(totalIncome)}\n` +
    `Gastos: ${formatCOP(totalExpense)}\n` +
    `Balance: ${formatCOP(balance)} — ${status}\n`;

  if (totalIncome > 0) {
    response += `\nHas usado el ${ratio}% de tus ingresos.\n`;
  }

  response += `\nPromedio diario de gasto: ${formatCOP(dailyAvg)}`;
  if (projected > 0) {
    response += `\nProyeccion a fin de mes: ${formatCOP(projected)}`;
  }
  if (daysLeft > 0 && balance > 0) {
    const dailyBudget = Math.round(balance / daysLeft);
    response += `\n\n💡 Te quedan ${daysLeft} dias. Puedes gastar ~${formatCOP(dailyBudget)} por dia para mantenerte en positivo.`;
  }

  return response;
}

/* ------------------------------------------------------------------ */
/*  Skill: Category Analysis                                          */
/* ------------------------------------------------------------------ */

function skillCategoryAnalysis(ctx: FinancialContext): string {
  const cats = ctx.currentMonthSummary.topCategories;
  if (cats.length === 0) {
    return "Todavia no hay suficientes datos para analizar por categoria. Registra algunas transacciones primero.";
  }

  let response = "📋 *Distribucion de gastos por categoria:*\n\n";
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    const bar = "█".repeat(Math.max(1, Math.round(cat.percentage / 10)));
    response += `${i + 1}. ${cat.name}: ${formatCOP(cat.amount)} (${cat.percentage.toFixed(1)}%)\n   ${bar}\n`;
  }

  const top = cats[0];
  response += `\n${top.name} es donde mas gastas con el ${top.percentage.toFixed(0)}% del total.`;

  if (cats.length >= 2) {
    const ratio = (cats[0].amount / cats[1].amount).toFixed(1);
    response += ` Gastas ${ratio}x mas que en ${cats[1].name}.`;
  }

  // Actionable recommendation
  if (top.percentage > 50) {
    response += `\n\n💡 Mas de la mitad de tus gastos van a ${top.name}. Revisa si puedes redistribuir algo.`;
  }

  return response;
}

/* ------------------------------------------------------------------ */
/*  Skill: Budget Check                                               */
/* ------------------------------------------------------------------ */

function skillBudgetCheck(ctx: FinancialContext): string {
  if (ctx.budgetAlerts.length === 0) {
    return (
      "No tienes alertas de presupuesto activas.\n\n" +
      "Eso puede significar que vas bien o que aun no has configurado limites.\n\n" +
      "💡 Tip: Define presupuestos por categoria para que Dumy te avise automaticamente cuando te acerques al limite."
    );
  }

  let response = "🎯 *Estado de presupuestos:*\n\n";
  for (const alert of ctx.budgetAlerts) {
    const icon = alert.isOverBudget ? "🔴" : alert.percentageUsed > 90 ? "🟠" : "🟡";
    const label = alert.isOverBudget
      ? "EXCEDIDO"
      : `${alert.percentageUsed.toFixed(0)}% usado`;
    response += `${icon} ${alert.categoryName}: ${label}\n`;
  }

  const exceeded = ctx.budgetAlerts.filter((a) => a.isOverBudget);
  const nearLimit = ctx.budgetAlerts.filter((a) => !a.isOverBudget && a.percentageUsed > 90);

  if (exceeded.length > 0) {
    response += `\n⚠️ Tienes ${exceeded.length} presupuesto(s) excedido(s).`;
    response += ` Intenta reducir gastos variables en esas categorias lo que resta del mes.`;
  }

  if (nearLimit.length > 0) {
    response += `\n\n⚡ ${nearLimit.length} presupuesto(s) cerca del limite. Ten cuidado con los gastos en esas areas.`;
  }

  return response;
}

/* ------------------------------------------------------------------ */
/*  Skill: Savings Tips (personalized)                                */
/* ------------------------------------------------------------------ */

function skillSavingsTips(ctx: FinancialContext): string {
  const { totalIncome, totalExpense, balance } = ctx.currentMonthSummary;
  const cats = ctx.currentMonthSummary.topCategories;
  const tips: string[] = [];
  const day = getDayOfMonth();
  const daysInMonth = getDaysInMonth();

  tips.push("💰 *Tips de ahorro personalizados:*\n");

  // Tip 1: 50/30/20 rule adapted
  if (totalIncome > 0) {
    const necessities = Math.round(totalIncome * 0.5);
    const wants = Math.round(totalIncome * 0.3);
    const savings = Math.round(totalIncome * 0.2);
    tips.push(
      `📐 Regla 50/30/20 para tus ingresos de ${formatCOP(totalIncome)}:\n` +
      `  • Necesidades: ${formatCOP(necessities)} (50%)\n` +
      `  • Gustos: ${formatCOP(wants)} (30%)\n` +
      `  • Ahorro: ${formatCOP(savings)} (20%)\n`
    );
  }

  // Tip 2: Category-specific savings
  if (cats.length > 0) {
    const topCat = cats[0];
    const fivePercent = Math.round(topCat.amount * 0.05);
    const tenPercent = Math.round(topCat.amount * 0.10);
    tips.push(
      `🎯 Si reduces un 5% en ${topCat.name}, ahorras ${formatCOP(fivePercent)}.\n` +
      `   Un 10% serian ${formatCOP(tenPercent)} extra al mes.`
    );
  }

  // Tip 3: Daily budget awareness
  if (balance > 0 && day < daysInMonth) {
    const daysLeft = daysInMonth - day;
    const dailyBudget = Math.round(balance / daysLeft);
    tips.push(
      `📅 Tu presupuesto diario disponible: ${formatCOP(dailyBudget)}.\n` +
      `   Quedan ${daysLeft} dias del mes.`
    );
  }

  // Tip 4: Negative balance warning
  if (balance < 0) {
    tips.push(
      "🚨 Tus gastos superan tus ingresos.\n" +
      "   Prioridad: revisa gastos no esenciales y congela compras nuevas hasta equilibrar."
    );
  }

  // Tip 5: Quick win strategies
  tips.push(
    "⚡ Estrategias rapidas:\n" +
    "  • Revisa 2 gastos evitables esta semana\n" +
    "  • Automatiza un ahorro pequeno fijo (asi sea $5.000)\n" +
    "  • Espera 24h antes de compras mayores a $50.000\n" +
    "  • Lleva registro de todo — eso ya lo estas haciendo con Dumy!"
  );

  // Tip 6: Spending pace
  if (totalExpense > 0 && totalIncome > 0) {
    const pacePercent = (day / daysInMonth) * 100;
    const spendPercent = (totalExpense / totalIncome) * 100;
    if (spendPercent > pacePercent + 10) {
      tips.push(
        `\n📈 Vas mas rapido de lo ideal: has gastado ${spendPercent.toFixed(0)}% ` +
        `pero solo ha pasado el ${pacePercent.toFixed(0)}% del mes. Reduce el ritmo.`
      );
    } else if (spendPercent < pacePercent - 10) {
      tips.push(
        `\n🌟 Buen ritmo! Has gastado solo ${spendPercent.toFixed(0)}% ` +
        `y ya paso el ${pacePercent.toFixed(0)}% del mes. Sigue asi.`
      );
    }
  }

  return tips.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Skill: Daily Recommendations                                      */
/* ------------------------------------------------------------------ */

function skillDailyRecommendations(ctx: FinancialContext): string {
  const { totalIncome, totalExpense, balance } = ctx.currentMonthSummary;
  const cats = ctx.currentMonthSummary.topCategories;
  const recentTxs = ctx.recentTransactions;
  const greeting = getDayGreeting();
  const recommendations: string[] = [];

  recommendations.push(`${greeting}! Aqui van tus recomendaciones:\n`);

  // Financial health assessment
  if (totalIncome === 0 && totalExpense === 0) {
    recommendations.push(
      "📝 *Empieza hoy:* Registra tu primer ingreso o gasto.\n" +
      "   Con datos reales puedo darte recomendaciones personalizadas."
    );
    return recommendations.join("\n");
  }

  // Balance-based recommendations
  if (balance > 0) {
    const savingsRate = ((balance / totalIncome) * 100).toFixed(0);
    if (Number(savingsRate) >= 20) {
      recommendations.push(
        `✅ Excelente! Tu tasa de ahorro es del ${savingsRate}%. Estas por encima del 20% recomendado.`
      );
    } else if (Number(savingsRate) >= 10) {
      recommendations.push(
        `👍 Bien, tu tasa de ahorro es del ${savingsRate}%. Intenta llegar al 20%.`
      );
    } else {
      recommendations.push(
        `⚠️ Tu tasa de ahorro es del ${savingsRate}%. Busca llegar al menos al 10%.`
      );
    }
  } else if (balance < 0) {
    recommendations.push(
      "🚨 Estas en deficit. Recomendaciones urgentes:\n" +
      "  1. Identifica 3 gastos que puedas eliminar esta semana\n" +
      "  2. Busca una fuente extra de ingreso temporal\n" +
      "  3. No uses credito para cubrir gastos corrientes"
    );
  }

  // Category-based recommendations
  if (cats.length > 0 && cats[0].percentage > 40) {
    recommendations.push(
      `\n📊 ${cats[0].name} consume el ${cats[0].percentage.toFixed(0)}% de tus gastos.\n` +
      `   Revisa si hay alternativas mas economicas o si puedes reducir frecuencia.`
    );
  }

  // Recent spending pattern
  if (recentTxs.length >= 3) {
    const expenses = recentTxs.filter((t) => t.type === "expense");
    if (expenses.length >= 3) {
      const avgRecent = Math.round(
        expenses.reduce((s, t) => s + t.amount, 0) / expenses.length
      );
      recommendations.push(
        `\n📈 Tu gasto promedio reciente: ${formatCOP(avgRecent)} por transaccion.`
      );
    }
  }

  // Budget alerts
  if (ctx.budgetAlerts.length > 0) {
    const exceeded = ctx.budgetAlerts.filter((a) => a.isOverBudget);
    if (exceeded.length > 0) {
      recommendations.push(
        `\n🎯 Presupuestos excedidos: ${exceeded.map((a) => a.categoryName).join(", ")}.\n` +
        `   Congela gastos en estas categorias.`
      );
    }
  }

  // Motivation
  recommendations.push(
    "\n💪 Recuerda: cada peso que registras te da mas control sobre tus finanzas."
  );

  return recommendations.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Skill: Receipt Analysis                                           */
/* ------------------------------------------------------------------ */

function skillReceiptAnalysis(
  ctx: FinancialContext,
  receipt?: ReceiptData,
): string {
  if (!receipt && !ctx.attachedReceipt) {
    return (
      "No tengo una factura adjunta en esta conversacion.\n\n" +
      "📸 Usa el modulo de escaneo para tomar foto de un recibo, " +
      "un precio o numeros escritos a mano, y lo analizo."
    );
  }

  const r = receipt ?? ctx.attachedReceipt!;
  const parts: string[] = [];

  parts.push("🧾 *Analisis del recibo:*\n");

  if (r.vendor) parts.push(`📍 Establecimiento: ${r.vendor}`);
  if (r.date) parts.push(`📅 Fecha: ${r.date}`);

  if (r.items.length > 0) {
    parts.push(`\n📋 Articulos detectados (${r.items.length}):`);
    for (const item of r.items) {
      parts.push(`  • ${item.description}: ${formatCOP(item.amount)}`);
    }
  }

  if (r.subtotal !== null) {
    parts.push(`\nSubtotal: ${formatCOP(r.subtotal)}`);
  }
  if (r.tax !== null) {
    parts.push(`IVA: ${formatCOP(r.tax)}`);
  }
  if (r.total !== null) {
    parts.push(`Total factura: ${formatCOP(r.total)}`);
  }

  parts.push(`Suma calculada de items: ${formatCOP(r.calculatedSum)}`);

  if (r.total !== null && r.calculatedSum > 0) {
    const diff = Math.abs(r.total - r.calculatedSum);
    if (diff > 0) {
      parts.push(
        `\nDiferencia: ${formatCOP(diff)}` +
        (r.tax !== null ? ` (IVA detectado: ${formatCOP(r.tax)})` : "")
      );
    }
  }

  // Context-aware analysis
  const { totalExpense } = ctx.currentMonthSummary;
  if (r.total !== null && totalExpense > 0) {
    const pct = ((r.total / totalExpense) * 100).toFixed(1);
    parts.push(
      `\n📊 Este recibo representa el ${pct}% de tus gastos totales del mes.`
    );
  }

  // Recommendation
  if (r.total !== null && r.total > 100000) {
    parts.push(
      `\n💡 Gasto significativo. Asegurate de registrarlo en la categoria correcta para un mejor seguimiento.`
    );
  }

  parts.push(`\nConfianza del escaneo: ${(r.confidence * 100).toFixed(0)}%`);

  return parts.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Skill: Number Sum (for handwritten numbers, prices, etc.)         */
/* ------------------------------------------------------------------ */

function skillNumberSum(
  ctx: FinancialContext,
  receipt?: ReceiptData,
): string {
  if (!receipt && !ctx.attachedReceipt) {
    return (
      "No tengo numeros para sumar. Escanea una imagen con numeros, " +
      "precios o un recibo para que pueda calcular el total."
    );
  }

  const r = receipt ?? ctx.attachedReceipt!;
  const parts: string[] = [];

  parts.push("🔢 *Suma de valores detectados:*\n");

  if (r.items.length > 0) {
    for (const item of r.items) {
      parts.push(`  ${item.description}: ${formatCOP(item.amount)}`);
    }
    parts.push(`  ${"─".repeat(30)}`);
    parts.push(`  SUMA TOTAL: ${formatCOP(r.calculatedSum)}`);
  }

  // Also show individual labeled totals if they exist
  const allValues: number[] = [];
  if (r.subtotal !== null) allValues.push(r.subtotal);
  if (r.tax !== null) allValues.push(r.tax);
  if (r.total !== null) allValues.push(r.total);
  for (const item of r.items) allValues.push(item.amount);

  if (r.items.length === 0 && allValues.length > 0) {
    parts.push("Valores detectados:");
    for (const v of allValues) {
      parts.push(`  • ${formatCOP(v)}`);
    }
    const sum = allValues.reduce((s, v) => s + v, 0);
    parts.push(`  ${"─".repeat(30)}`);
    parts.push(`  SUMA TOTAL: ${formatCOP(sum)}`);
  }

  if (r.items.length === 0 && allValues.length === 0) {
    parts.push("No se detectaron numeros claros en la imagen. Intenta con otra foto mas nitida.");
  }

  return parts.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Skill: Trend Analysis                                             */
/* ------------------------------------------------------------------ */

function skillTrendAnalysis(ctx: FinancialContext): string {
  const txs = ctx.recentTransactions;
  if (txs.length === 0) {
    return "Necesito mas transacciones para identificar tendencias. Sigue registrando tus movimientos.";
  }

  const expenses = txs.filter((t) => t.type === "expense");
  const incomes = txs.filter((t) => t.type === "income");

  let response = "📈 *Analisis de tendencias:*\n\n";
  response += "Ultimas transacciones:\n";
  for (const tx of txs.slice(0, 5)) {
    const sign = tx.type === "income" ? "+" : "-";
    response += `  ${tx.date} | ${tx.description} | ${sign}${formatCOP(tx.amount)} (${tx.categoryName})\n`;
  }

  if (expenses.length > 0) {
    const avgExpense = Math.round(
      expenses.reduce((s, t) => s + t.amount, 0) / expenses.length
    );
    const maxExpense = Math.max(...expenses.map((t) => t.amount));
    const minExpense = Math.min(...expenses.map((t) => t.amount));
    response += `\nPromedro por gasto: ${formatCOP(avgExpense)}`;
    response += `\nMayor gasto: ${formatCOP(maxExpense)}`;
    response += `\nMenor gasto: ${formatCOP(minExpense)}`;
  }

  if (incomes.length > 0) {
    const totalIncome = incomes.reduce((s, t) => s + t.amount, 0);
    response += `\n\nIngresos acumulados recientes: ${formatCOP(totalIncome)}`;
  }

  // Spending pace insight
  const { totalExpense, totalIncome } = ctx.currentMonthSummary;
  if (totalExpense > 0 && totalIncome > 0) {
    const day = getDayOfMonth();
    const daysInMonth = getDaysInMonth();
    const idealPace = (day / daysInMonth) * totalIncome;
    if (totalExpense > idealPace) {
      response += `\n\n⚠️ Vas ${((totalExpense / idealPace - 1) * 100).toFixed(0)}% por encima del ritmo ideal de gasto.`;
    } else {
      response += `\n\n✅ Tu ritmo de gasto esta controlado.`;
    }
  }

  return response;
}

/* ------------------------------------------------------------------ */
/*  Skill: Smart Alerts                                               */
/* ------------------------------------------------------------------ */

function skillSmartAlert(ctx: FinancialContext): string {
  const alerts: string[] = [];
  const { totalIncome, totalExpense, balance } = ctx.currentMonthSummary;

  alerts.push("🔔 *Alertas inteligentes:*\n");

  let hasAlerts = false;

  // Budget exceeded alerts
  const exceeded = ctx.budgetAlerts.filter((a) => a.isOverBudget);
  if (exceeded.length > 0) {
    hasAlerts = true;
    for (const a of exceeded) {
      alerts.push(`🔴 Presupuesto EXCEDIDO en ${a.categoryName} (${a.percentageUsed.toFixed(0)}%)`);
    }
  }

  // Near limit alerts
  const nearLimit = ctx.budgetAlerts.filter(
    (a) => !a.isOverBudget && a.percentageUsed > 80
  );
  if (nearLimit.length > 0) {
    hasAlerts = true;
    for (const a of nearLimit) {
      alerts.push(`🟡 ${a.categoryName} cerca del limite (${a.percentageUsed.toFixed(0)}%)`);
    }
  }

  // Deficit alert
  if (balance < 0) {
    hasAlerts = true;
    alerts.push(`🔴 Deficit de ${formatCOP(Math.abs(balance))}. Gastos > Ingresos.`);
  }

  // Spending pace alert
  if (totalIncome > 0) {
    const day = getDayOfMonth();
    const daysInMonth = getDaysInMonth();
    const paceRatio = (totalExpense / totalIncome) / (day / daysInMonth);
    if (paceRatio > 1.3) {
      hasAlerts = true;
      alerts.push(
        `🟠 Ritmo de gasto acelerado: ${(paceRatio * 100).toFixed(0)}% del ritmo ideal.`
      );
    }
  }

  // High concentration in one category
  const cats = ctx.currentMonthSummary.topCategories;
  if (cats.length > 0 && cats[0].percentage > 60) {
    hasAlerts = true;
    alerts.push(
      `🟡 Alta concentracion: ${cats[0].percentage.toFixed(0)}% de gastos en ${cats[0].name}.`
    );
  }

  if (!hasAlerts) {
    alerts.push("✅ No hay alertas activas. Todo esta bajo control!");
    alerts.push("\n💡 Sigue registrando tus movimientos para mantener el seguimiento al dia.");
  }

  return alerts.join("\n");
}

/* ------------------------------------------------------------------ */
/*  Skill: Greeting                                                   */
/* ------------------------------------------------------------------ */

function skillGreeting(ctx: FinancialContext): string {
  const greeting = getDayGreeting();
  const name = ctx.userName ? `, ${ctx.userName}` : "";
  const { balance, totalExpense, totalIncome } = ctx.currentMonthSummary;

  let response = `${greeting}${name}! Soy Dumy, tu asistente financiero.\n`;

  if (totalIncome > 0 || totalExpense > 0) {
    response += `\n📊 Tu mes hasta hoy:\n`;
    response += `  Ingresos: ${formatCOP(totalIncome)}\n`;
    response += `  Gastos: ${formatCOP(totalExpense)}\n`;
    response += `  Balance: ${formatCOP(balance)}\n`;
  }

  // Quick status
  const exceeded = ctx.budgetAlerts.filter((a) => a.isOverBudget);
  if (exceeded.length > 0) {
    response += `\n⚠️ Tienes ${exceeded.length} presupuesto(s) excedido(s).`;
  }

  response += "\n\nPreguntame lo que necesites: gastos, ahorro, presupuestos, o escanea un recibo.";

  return response;
}

/* ------------------------------------------------------------------ */
/*  Skill: Help                                                       */
/* ------------------------------------------------------------------ */

function skillHelp(): string {
  return (
    "🤖 *Soy Dumy, tu asistente financiero.* Estas son mis habilidades:\n\n" +
    "📊 *Resumen financiero* — \"Como van mis gastos?\"\n" +
    "📋 *Analisis por categoria* — \"En que gasto mas?\"\n" +
    "🎯 *Presupuestos* — \"Como van mis presupuestos?\"\n" +
    "💰 *Tips de ahorro* — \"Dame consejos para ahorrar\"\n" +
    "💡 *Recomendaciones* — \"Que me recomiendas?\"\n" +
    "🧾 *Analisis de recibos* — Escanea y analizo facturas\n" +
    "🔢 *Suma de numeros* — Escanea precios o numeros escritos a mano\n" +
    "📈 *Tendencias* — \"Como va mi tendencia de gastos?\"\n" +
    "🔔 *Alertas* — \"Hay algo que deba saber?\"\n\n" +
    "Todo funciona sin internet. Tus datos nunca salen del dispositivo.\n\n" +
    "💡 Tip: Puedes adjuntar fotos de recibos, precios de productos o " +
    "numeros escritos a mano directo en el chat."
  );
}

/* ------------------------------------------------------------------ */
/*  Skill: General / Fallback                                         */
/* ------------------------------------------------------------------ */

function skillGeneral(ctx: FinancialContext): string {
  const { totalExpense, balance } = ctx.currentMonthSummary;

  if (totalExpense === 0) {
    return (
      "No tengo suficientes datos para responder con precision.\n\n" +
      "Empieza registrando tus ingresos y gastos para que pueda ayudarte mejor.\n\n" +
      "Escribe \"ayuda\" para ver todo lo que puedo hacer."
    );
  }

  return (
    `Tu balance actual del mes es ${formatCOP(balance)}.\n\n` +
    "Puedo ayudarte con:\n" +
    "  • \"resumen\" — Panorama de gastos\n" +
    "  • \"categorias\" — Desglose por tipo\n" +
    "  • \"tips\" — Consejos de ahorro\n" +
    "  • \"recomendaciones\" — Sugerencias personalizadas\n" +
    "  • \"alertas\" — Ver avisos importantes\n\n" +
    "O escanea un recibo/foto para analisis."
  );
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

/**
 * Generate an intelligent response based on the user's message,
 * their real financial context, and the detected skill.
 * Fully offline, no network needed.
 */
export function generateSmartResponse(
  message: string,
  context: FinancialContext,
  receipt?: ReceiptData,
): string {
  const hasReceipt = !!(receipt ?? context.attachedReceipt);
  const skill = classifySkill(message, hasReceipt);

  switch (skill) {
    case "spending_overview":
      return skillSpendingOverview(context);
    case "category_analysis":
      return skillCategoryAnalysis(context);
    case "budget_check":
      return skillBudgetCheck(context);
    case "savings_tips":
      return skillSavingsTips(context);
    case "daily_recommendations":
      return skillDailyRecommendations(context);
    case "receipt_analysis":
      return skillReceiptAnalysis(context, receipt);
    case "number_sum":
      return skillNumberSum(context, receipt);
    case "trend_analysis":
      return skillTrendAnalysis(context);
    case "smart_alert":
      return skillSmartAlert(context);
    case "greeting":
      return skillGreeting(context);
    case "help":
      return skillHelp();
    case "general":
      return skillGeneral(context);
  }
}

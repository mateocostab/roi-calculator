import type { TranslationKey } from './es';

export const en: Record<TranslationKey, string> = {
  // Header
  'header.pretitle': 'CRO ROI Calculator',
  'header.title': 'How much money are you leaving on the table?',
  'header.titleBefore': 'How much money are you ',
  'header.titleHighlight': 'leaving on the table',
  'header.titleAfter': '?',
  'header.subtitle': 'Discover the potential of optimizing your conversion rate',
  'header.language': 'Language',
  'header.currency': 'Currency',

  // Input labels
  'inputs.title': 'Your Store Data',
  'inputs.visitors': 'Monthly Visitors',
  'inputs.cvr': 'Conversion Rate (%)',
  'inputs.aov': 'Average Order Value',
  'inputs.adSpend': 'Ad Spend',

  // Scenarios
  'scenarios.title': 'Improvement Scenario',
  'scenarios.conservative': 'Conservative',
  'scenarios.conservativeDesc': '+15% CVR',
  'scenarios.expected': 'Expected',
  'scenarios.expectedDesc': '+25% CVR',
  'scenarios.optimistic': 'Accelerated',
  'scenarios.optimisticDesc': '+40% CVR',
  'scenarios.dataSource': 'Based on results from 100+ stores',
  'scenarios.monthlyImpact': 'Monthly impact at month 3',
  'scenarios.extraOrders': 'Extra orders',
  'scenarios.newRoas': 'New ROAS',
  'scenarios.gradualNote': 'Results build gradually: Month 1 (25%) → Month 2 (60%) → Month 3+ (100%)',

  // Efficiency metrics
  'efficiency.title': 'Efficiency Metrics',
  'efficiency.roas': 'ROAS',
  'efficiency.roasDesc': 'Return on ad spend',
  'efficiency.roasTooltip': 'Return On Ad Spend: For every $1 spent on ads, how many $ you generate in sales',
  'efficiency.cpa': 'CPA',
  'efficiency.cpaDesc': 'Cost per acquisition',
  'efficiency.cpaTooltip': 'Cost Per Acquisition: How much it costs to acquire each customer',
  'efficiency.rps': 'RPS',
  'efficiency.rpsDesc': 'The #1 CRO metric',
  'efficiency.rpsTooltip': 'Revenue Per Session: Average revenue per visitor. The most important CRO metric because it captures both conversion rate AND average order value',
  'efficiency.current': 'Current',
  'efficiency.improved': 'With CRO',

  // Scaling
  'scaling.title': 'Scaling Simulator',
  'scaling.reinvestment': 'Reinvestment Percentage',
  'scaling.reinvestmentDesc': 'Reinvest additional revenue into more advertising',
  'scaling.months': 'Projection Months',
  'scaling.monthsDesc': 'Time period for revenue projection',

  // Revenue results
  'revenue.title': 'Revenue Results',
  'revenue.current': 'Current Revenue',
  'revenue.currentDesc': 'Without optimization',
  'revenue.improved': 'With CRO',
  'revenue.improvedDesc': 'Improved conversion rate',
  'revenue.scaled': 'With Scaling',
  'revenue.scaledDesc': 'CRO + Reinvestment',
  'revenue.increment': 'Increment',
  'revenue.incrementDesc': 'Additional revenue',
  'revenue.monthly': '/month',
  'revenue.total': 'Projected total',

  // ROI Calculator
  'roi.title': 'ROI Calculator',
  'roi.investment': 'Monthly CRO Investment',
  'roi.totalInvestment': 'Total Investment',
  'roi.additionalRevenue': 'Additional Revenue',
  'roi.roiMultiple': 'ROI',
  'roi.payback': 'Recover {amount} in',
  'roi.paybackTooltip': 'Month when your cumulative additional revenue covers your total investment',
  'roi.roiAt3Months': 'ROI at 3 months',
  'roi.roiAt3MonthsTooltip': 'Return on the first 3 months of investment. We guarantee at least 2x.',
  'roi.guaranteeTitle': 'Results Guarantee',
  'roi.guaranteeText': 'If you don\'t double your investment with us in 3 months, we refund your money.',

  // Loss aversion message
  'loss.title': 'Without optimization, you\'re losing',
  'loss.monthly': 'every month',
  'loss.annually': 'per year',

  // Chart
  'chart.title': 'Revenue Projection',
  'chart.current': 'Current',
  'chart.improved': 'With CRO',
  'chart.scaled': 'With Scaling',
  'chart.scaledNoCro': 'Scale without CRO',
  'chart.month': 'Month',
  'chart.revenue': 'Revenue',
  'chart.cumulative': 'Cumulative',
  'chart.implementationPeriod': 'Implementation',
  'chart.guaranteeZone': '2x ROI Guarantee',
  'chart.accessibleDescription': 'Revenue projection chart showing 3 lines: current, with CRO, and scaled over {months} months',

  // Actions
  'actions.reset': 'Reset',
  'actions.resetTooltip': 'Reset to default values',

  // CTA
  'cta.stopLosing': 'Stop leaving money on the table',

  // Qualification
  'qualification.title': 'Your Recommendation',
  'qualification.croRecurring': 'CRO Recurring',
  'qualification.croRecurringDesc': 'Continuous optimization with a dedicated team for high-traffic sites',
  'qualification.croRecurringCta': 'Schedule Strategy Call',
  'qualification.croRecurringReady': 'Your store is ready to scale with CRO',
  'qualification.highConversion': 'High Conversion eCom',
  'qualification.highConversionDesc': 'Personalized CRO audit and roadmap for your store',
  'qualification.highConversionCta': 'Get Your CRO Roadmap',
  'qualification.highConversionReady': 'First, let\'s optimize your foundation',
  'qualification.threshold': 'Threshold: 80K visitors/month',

  // Format
  'format.month': 'month',
  'format.months': 'months',
  'format.lessThanOneMonth': '< 1 month',

  // Social proof
  'socialProof.trusted': '+$30M USD generated for brands like',

  // Footer
  'footer.poweredBy': 'Powered by',
  'footer.brand': 'ConvertMate',

  // Guarantees section
  'guarantees.title': 'Not One, But',
  'guarantees.titleAccent': 'Seven Guarantees',
  'guarantees.subtitle': 'We Stand Behind',
  'guarantees.prefix': 'We guarantee',

  'guarantees.1.name': '"Zero Failures"',
  'guarantees.1.description': 'we\'ll use the same system that has increased conversion for every store we\'ve optimized. Doesn\'t matter if it was managed by an internal team or another agency. We\'ve outperformed them all.',

  'guarantees.2.name': '"Clients Don\'t Leave"',
  'guarantees.2.description': 'our average client stays over a year. We don\'t lock anyone in with long contracts. The results make it hard to leave.',

  'guarantees.3.name': '"Top 10% of the Market"',
  'guarantees.3.description': 'after 90 days, your store will outperform 90% of competitors in RPS (Revenue Per Session). That means 3-9x more sales per visitor than your competition.',

  'guarantees.4.name': '"Conversion Without Discounts"',
  'guarantees.4.description': 'we won\'t rely on coupons, destroyed margins, or fake urgency. We optimize your store to build trust and purchase intent. Your margins stay intact.',

  'guarantees.5.name': '"Relentless Optimization"',
  'guarantees.5.description': 'while others design and forget, we optimize weekly. We leverage 200+ winning A/B tests to force your revenue upward.',

  'guarantees.6.name': '"Always Informed"',
  'guarantees.6.description': 'you\'ll get weekly performance reports and monthly analyses. You\'ll always know where we are and what\'s next.',

  'guarantees.7.name': '"Never Overstretched"',
  'guarantees.7.description': 'we\'re not a bloated agency chasing logos. We take few brands at a time. Your account gets senior attention, fast delivery, and real strategy.',
};

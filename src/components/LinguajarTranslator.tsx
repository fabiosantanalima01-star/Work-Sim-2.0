/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Languages, Search, Sparkles, ArrowRight, BookOpen, Quote, RefreshCw, AlertCircle, CheckSquare, FileText, Landmark, Settings } from "lucide-react";

interface TranslationItem {
  term: string;
  category: "Vínculo" | "Verbas" | "Saúde & Afastamento" | "Padrão CLT";
  ptDefinition: string;
  enDefinition: string;
  analogyPt: string;
  analogyEn: string;
}

const DICTIONARY: TranslationItem[] = [
  {
    term: "Onerosidade",
    category: "Vínculo",
    ptDefinition: "Elemento do vínculo onde o trabalhador presta serviços mediante contraprestação pecuniária (salário), não havendo presunção de trabalho voluntário gratuito.",
    enDefinition: "Onerousness (Paid Labor) – The requirement that employment must be paid. Work is not assumed to be voluntary or free.",
    analogyPt: "A regra de ouro: 'Trabalhou, pingou'. Nada de pagar funcionário com elogios, caridade ou promessas de networking. Sem salário definido no contrato, não há vínculo CLT válido.",
    analogyEn: "The golden rule: 'Worked, paid'. No paying employees with high-fives, empty praises, or promise of 'networking'. Without a contract-specified base salary, there is no valid CLT linkage."
  },
  {
    term: "Subordinação",
    category: "Vínculo",
    ptDefinition: "Elemento do vínculo onde o empregado segue ordens, horários e diretrizes do empregador, sob poder diretivo, regulamentar e disciplinar.",
    enDefinition: "Subordination – The employee follows orders, schedules, and guidelines set by the employer.",
    analogyPt: "No cadastro inicial (S-2200), você vai informar a jornada semanal (ex: 44h, 40h, 36h). Isso define o divisor para o cálculo do valor da hora normal (220, 200, 180).",
    analogyEn: "In the initial S-2200 eSocial Registry, you define the weekly shift (e.g. 44h, 40h, 36h). This dictates the standard monthly hours divisor (220, 200 or 180)."
  },
  {
    term: "Salário-Base",
    category: "Vínculo",
    ptDefinition: "Remuneração fixa contratual que serve como referência para cálculo de todos os direitos trabalhistas.",
    enDefinition: "Base Salary – Fixed contractual remuneration that serves as a reference for calculating all labor rights.",
    analogyPt: "O salário-base NÃO inclui comissões, horas extras, adicionais, gratificações ou benefícios. É a parte fixa do contracheque e baliza descontos como Vale-Transporte (6%).",
    analogyEn: "Base salary excludes commissions, overtime, premiums, or bonuses. It's the starting point for calculating all things, like the 6% maximum deduction for transit vouchers."
  },
  {
    term: "Horas Extras (HE)",
    category: "Verbas",
    ptDefinition: "Tempo trabalhado além da jornada contratual (geralmente 44h semanais ou 8h diárias), pago com adicional mínimo de 50% (dias úteis) ou 100% (domingos/feriados).",
    enDefinition: "Overtime (OT) – Time worked beyond the contractual weekly hours (typically 44h/week or 8h/day), paid with a minimum 50% premium (weekdays) or 100% (Sundays/holidays).",
    analogyPt: "O primeiro passo é calcular a hora normal (Salário ÷ Divisor). Hora extra 50% = Valor hora normal × 1,5. Hora extra 100% = Valor hora normal × 2,0. Guarde estes cartões por 5 anos (art. 74 da CLT)!",
    analogyEn: "First find your normal hourly rate: Salary ÷ Divisor. Then apply OT 50%: Hourly × 1.5, or OT 100%: Hourly × 2. Always store timecards responsibly for 5 years!"
  },
  {
    term: "DSR (Descanso Semanal Remunerado)",
    category: "Verbas",
    ptDefinition: "Direito de usufruir de um dia de descanso remunerado por semana (geralmente aos domingos). Pode ser perdido/descontado em caso de faltas injustificadas na semana.",
    enDefinition: "DSR (Paid Weekly Rest) – The right to one paid rest day per week (usually Sunday). It can be lost and docked if the employee has unexcused absences.",
    analogyPt: "A firma te paga para curtir a preguiça de domingo, desde que você não falte injustificadamente. Para horas extras e comissões, o DSR calcula-se separadamente: (Variáveis do mês) ÷ (Dias úteis) × (Domingos + Feriados).",
    analogyEn: "Company pays you to relax on Sunday! DSR on variable earnings (overtime or commissions) uses a strict formula: (Variable total) ÷ (Business days) × (Sundays + Holidays)."
  },
  {
    term: "13º Salário (Gratificação Natalina)",
    category: "Verbas",
    ptDefinition: "Pagamento anual equivalente a 1/12 da remuneração por mês trabalhado (acima de 15 dias no mês), devido entre fevereiro e dezembro.",
    enDefinition: "13th Salary (Christmas Bonus) – Annual payment equivalent to 1/12 of the monthly salary for each month worked (above 15 days in the month), paid between February and December.",
    analogyPt: "Admissões no meio do ano geram 13º proporcional. Se o estagiário entrou em maio, receberá 8/12 no final do ano civil. Na rescisão, calcula-se com base nos fragmentos de meses do ciclo ativo.",
    analogyEn: "If hired in May, the worker receives a proportional 8/12 bonus in December. On resignation, we divide the wage by 12 and multiply by active calendar months."
  },
  {
    term: "Férias (e 1/3 Constitucional)",
    category: "Verbas",
    ptDefinition: "Direito a 30 dias de descanso após 12 meses de trabalho (período aquisitivo), pago com adicional de 1/3 da remuneração.",
    enDefinition: "Vacation (plus 1/3 constitutional) – Right to 30 days of rest after 12 months of work (accrual period), paid with an additional one-third of the monthly salary.",
    analogyPt: "Tire férias! Férias vencidas (não concedidas em até 12 meses após o período aquisitivo) devem ser pagas em dobro pelo empregador conforme o Art. 137 da CLT. Cálculo: (Base + Média Variáveis) × 1,3333.",
    analogyEn: "Take your time off! Accrued vacations not granted within 12 months of the acquisition period must be paid in double by the employer under Article 137. Calculation is simply (Base + Averages) × 1.3333."
  },
  {
    term: "FGTS (Fundo de Garantia do Tempo de Serviço)",
    category: "Verbas",
    ptDefinition: "Depósito mensal obrigatório de 8% sobre a remuneração total do funcionário em conta vinculada na Caixa, que pode ser sacada nas hipóteses legais.",
    enDefinition: "FGTS (Service Time Guarantee Fund) – Monthly mandatory deposit of 8% of the employee's total earnings into a linked account at Caixa, plus 40% severance fine on dismissals.",
    analogyPt: "Poupança blindada do colaborador. O FGTS mensal é calculado sobre Proventos × 8%. Em rescisões sem justa causa o patrão arca com a multa rescisória de 40%, ou 20% no acordo consensual (Art. 484-A).",
    analogyEn: "A secure retirement and housing fund. On unjust dismissals, the employer pays a 40% fine on the lifetime balance, or 20% if done by mutual consensus (Art 484-A)."
  },
  {
    term: "INSS (Desconto do Funcionário)",
    category: "Verbas",
    ptDefinition: "Contribuição previdenciária descontada mensalmente do salário do funcionário, calculada pela tabela progressiva por faixas de salário (7,5% a 14% em 2026).",
    enDefinition: "INSS (Employee Withholding) – Social security contribution deducted monthly from the employee's salary, calculated using a progressive bracketed table (7.5% to 14% in 2026).",
    analogyPt: "O INSS do empregado NÃO usa alíquota única sobre o salário todo! É a somatória ponderada por faixas progressivas fatiadas. Em 2026 a tabela vai de 7,5% até o teto de alíquota efetiva de 14%.",
    analogyEn: "Employee social security is NOT a single flat percentage on gross pay. It's built slice-by-slice progressively depending on regulatory brackets, ranging from 7.5% up to a 14% cap in 2026."
  },
  {
    term: "INSS Patronal (Empregador)",
    category: "Verbas",
    ptDefinition: "Contribuição previdenciária obrigatória de 20% sobre a folha de pagamento (todos os proventos), paga exclusivamente pelo empregador.",
    enDefinition: "Employer INSS – Mandatory social security contribution of 20% on the total payroll (all earnings), paid exclusively by the employer.",
    analogyPt: "Enquanto o INSS do colaborador é descontado dele, o INSS Patronal é uma obrigação exclusivamente patronal calculada por fora aplicável como taxa fixa extra (20% sobre o total de proventos).",
    analogyEn: "Unlike employee INSS which is withheld, the patronal (employer) INSS is paid out-of-pocket directly by the company, computed as a fixed 20% of the aggregate payroll provents value."
  },
  {
    term: "CTPS (Carteira de Trabalho e Previdência Social)",
    category: "Padrão CLT",
    ptDefinition: "Documento obrigatório para início do contrato de trabalho. Atualmente digital (CTPS Digital) e alimentada pelos eventos oficiais do eSocial.",
    enDefinition: "CTPS (Work and Social Security Card) – Mandatory document for starting an employment contract. Currently digital.",
    analogyPt: "Na admissão, confira: nome completo, data de nascimento, CPF, PIS, série e número da carteira. O sistema do eSocial (evento S-2200) exige o número do PIS ou NIT.",
    analogyEn: "Hiring standard check: full legal name, birth date, CPF, PIS, series and work card number. eSocial event S-2200 requires compiling valid PIS or NIT parameters."
  },
  {
    term: "ASO (Atestado de Saúde Ocupacional)",
    category: "Saúde & Afastamento",
    ptDefinition: "Documento médico exigido na admissão (ASO Admissional), periódico, de retorno ao trabalho ou demissional recomendados pela NR-07.",
    enDefinition: "ASO (Occupational Health Certificate) – Medical document required for hiring, periodic exams, return-to-work, or termination (NR-07).",
    analogyPt: "O ASO Admissional deve ser feito antes do início das atividades de trabalho (ou no máximo no primeiro dia de expediente). Sem ASO, a admissão está irregular e o eSocial pode autuar a empresa.",
    analogyEn: "Pre-employment health checkups must be completed before the employee's first day of active operations. Lack of ASO compromises regulatory compliance."
  },
  {
    term: "Declaração de Dependentes (IRRF)",
    category: "Padrão CLT",
    ptDefinition: "Documento onde o funcionário informa dependentes (cônjuge, filhos, enteados) para dedução do Imposto de Renda Retido na Fonte.",
    enDefinition: "Dependents Declaration – Document where the employee informs dependents (spouse, children, stepchildren) for Income Tax withholding deduction.",
    analogyPt: "O valor da dedução oficial por dependente declarado em 2026 é de R$ 189,59 na base de cálculo de IRRF por dependente. Ideal coletar assinado logo na admissão.",
    analogyEn: "In 2026, each registered dependent deducts R$ 189.59 from the withholding tax calculation base. Essential to collect employee signatures early on admission."
  },
  {
    term: "Vale-Transporte (Declaração)",
    category: "Padrão CLT",
    ptDefinition: "Documento onde o funcionário opta por receber ou não o benefício do vale-transporte, informando a quantidade de conduções diárias.",
    enDefinition: "Transportation Voucher Declaration – Document where the employee opts to receive or not receive transportation vouchers, informing the daily number of trips.",
    analogyPt: "O desconto do VT é de até 6% sobre o salário base, limitado ao valor real do benefício fornecido. Se o funcionário não optar ou fizer trajeto próprio, não há desconto.",
    analogyEn: "Transit voucher salary deductions are capped at 6% of the base wage. If the actual cost is lower, or the worker declines to participate, zero deductions can be drawn."
  },
  {
    term: "Fidúcia (e Quebra de Fidúcia)",
    category: "Vínculo",
    ptDefinition: "Relação de extrema confiança mútua que fundamenta o elo entre o empregado e o empregador. O rompimento desse dever leal enseja imediata justa causa.",
    enDefinition: "Fiduciary Trust (Breach of Trust): The mutual confidence between employee and employer. A serious violation (theft, dishonesty) breaks this bond and triggers a dismissal with just cause.",
    analogyPt: "É como traição em relacionamento sério: uma vez perdida, o namoro com a firma acaba na hora.",
    analogyEn: "Like relationship betrayal: once trust is broken, the match is over, and you are dismissed immediately."
  },
  {
    term: "Desvio de Função",
    category: "Padrão CLT",
    ptDefinition: "Ocorre quando o trabalhador executa tarefas incompatíveis com o cargo pactuado, ordinárias de cargo superior melhor remunerado, sem a devida alteração salarial.",
    enDefinition: "Deviation of Function (Job Misalignment): When an employee routinely performs high-responsibility duties of a different higher rank without receiving the legal salary adjustment.",
    analogyPt: "Contratar pacote de internet básico de 10 megas e exigir performance de fibra de alta velocidade.",
    analogyEn: "Buying a basic economy ticket but expecting first-class treatment and legroom for free."
  },
  {
    term: "Adicional de Insalubridade",
    category: "Saúde & Afastamento",
    ptDefinition: "Adicional pago em percentuais de 10%, 20% ou 40% do salário mínimo por trabalho exposto a agentes nocivos (como barulho extremo, frio/calor químico, poeira nociva).",
    enDefinition: "Insalubrity Premium (Hazard Premium): Extra pay calculated as 10%, 20%, or 40% of the minimum wage due to prolonged exposure to health-hazardous factors (loud noise, intense heat, chemicals).",
    analogyPt: "Um bônus financeiro compensatório pelas condições agressivas e nocivas de saúde no ambiente.",
    analogyEn: "A monetary compensation because your job conditions damage your physical health over the long run."
  },
  {
    term: "Adicional de Periculosidade",
    category: "Saúde & Afastamento",
    ptDefinition: "Adicional fixo de 30% em cima do salário base por atividades com risco iminente de morte (fogo, eletricidade de alta tensão, explosivos).",
    enDefinition: "Danger Premium (Risk of Death Bonus): A flat 30% premium added on top of the base salary for activities carrying instant life-threatening risks (high voltage, explosives, radiation).",
    analogyPt: "O bônus de sobrevivência de risco agudo. Pisou em falso, é fatal. Por isso, a taxa de 30% é fixa e mais alta sobre a base.",
    analogyEn: "A survival bonus. One wrong move could be fatal. Therefore, it is a strict 30% of your raw base pay."
  },
  {
    term: "Justa Causa por Improbidade",
    category: "Saúde & Afastamento",
    ptDefinition: "Dispensa imediata por furto, atos desonestos ou falsificação. O trabalhador sai sem FGTS, aviso prévio, seguro ou multa rescisória.",
    enDefinition: "Just Cause for Improbity (Fraud/Theft): Immediate termination due to theft, fraud, or forged doctor notes. The worker loses notice pay, FGTS withdrawal, and unemployment benefits.",
    analogyPt: "Ser pego com a mão na botija. Perda total de direitos rescisórios e desgaste severo no e-Social.",
    analogyEn: "Caught red-handed. Zero standard severance package rights and a heavy black mark on your career file."
  }
];

const JARGON_SIMULATIONS = [
  {
    formalPt: "O TRCT acusou ausência de recolhimento do FGTS devido a rescisão sem justa causa no interregno do aviso prévio trabalhado.",
    engTrans: "The Termination Form (TRCT) indicates a failure to deposit the severance fund (FGTS) during the 30-day worked notice period prior to layout separation.",
    contextPt: "Pendência de rescisão contratual",
    contextEn: "Severance & Notice Discrepancy"
  },
  {
    formalPt: "A empresa procedeu à compensação intrajornada por meio de banco de horas sem previsão em convenção coletiva.",
    engTrans: "The company traded overtime hours for time-off using an overtime bank system without any authorized union or collective bargaining contract.",
    contextPt: "Banco de Horas irregular",
    contextEn: "Illegal Overtime Tracking"
  }
];

interface LinguajarTranslatorProps {
  appLanguage: "pt" | "en";
  onChangeLanguage: (lang: "pt" | "en") => void;
}

export default function LinguajarTranslator({
  appLanguage,
  onChangeLanguage
}: LinguajarTranslatorProps) {
  const [activeSection, setActiveSection] = useState<"dictionary" | "resumao" | "checklist">("dictionary");
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({
    cpf: false,
    ctps: false,
    aso: false,
    dependentes: false,
    vt: false,
    salario: false,
    jornada: false,
    admissao: false,
    cbo: false
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "Vínculo" | "Verbas" | "Saúde & Afastamento" | "Padrão CLT">("all");
  const [customInput, setCustomInput] = useState("");
  const [customTranslation, setCustomTranslation] = useState<string | null>(null);
  const [translating, setTranslating] = useState(false);
  const [activeSimulationIndex, setActiveSimulationIndex] = useState(0);

  // Filter dictionary items
  const filteredItems = DICTIONARY.filter(item => {
    const termMatches = item.term.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatches = appLanguage === "en" 
      ? item.enDefinition.toLowerCase().includes(searchQuery.toLowerCase())
      : item.ptDefinition.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = termMatches || descMatches;
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTranslateCustom = () => {
    if (!customInput.trim()) return;
    setTranslating(true);
    setCustomTranslation(null);
    
    setTimeout(() => {
      const lower = customInput.toLowerCase();
      let res = "";
      
      if (appLanguage === "en") {
        if (lower.includes("onero") || lower.includes("pay") || lower.includes("money")) {
          res = "🇺🇸 [GLOSSARY TRANSLATION] 'Onerosidade' relates to paid labor. In Brazilian CLT, nobody works for free or volunteer expectations; employers must pay for all working hours on contract.";
        } else if (lower.includes("dsr") || lower.includes("rest") || lower.includes("sunday")) {
          res = "🇺🇸 [GLOSSARY TRANSLATION] 'DSR' (Weekly Rest): If an employee misses work without a doctor's note (atestado), the employer will dock both the missed day AND the Sunday paid DSR rest day!";
        } else if (lower.includes("insalu") || lower.includes("health") || lower.includes("hazard")) {
          res = "🇺🇸 [GLOSSARY TRANSLATION] 'Insalubridade': Hazard/unhealthy pay. Premium of 10%, 20%, or 40% of the minimum wage for working with toxic noise, chemicals, or temperature conditions.";
        } else if (lower.includes("danger") || lower.includes("perig") || lower.includes("death")) {
          res = "🇺🇸 [GLOSSARY TRANSLATION] 'Periculosidade': Danger risk pay. High immediate risk of death (high voltage, explosions, fuels). Earns a flat 30% added directly on top of the base salary.";
        } else {
          res = "🇺🇸 [GLOSSARY TRANSLATION] Brazilian CLT terms require formal documents. Tip for English trainees: Always double-check timecards (cartão de ponto), doctors' credentials, and FGTS calculations to avoid Labor lawsuits!";
        }
      } else {
        if (lower.includes("onero") || lower.includes("pagar")) {
          res = "🇧🇷 [TRADUÇÃO DE CONCEITO] 'Onerosidade' significa retribuição de salário. Pela CLT, trabalho de empregado não se presume voluntário; trabalhou, a firma tem a obrigação de pagar.";
        } else if (lower.includes("dsr") || lower.includes("folga") || lower.includes("domingo")) {
          res = "🇧🇷 [TRADUÇÃO DE CONCEITO] 'DSR' (Descanso Semanal Remunerado): Se faltar no meio da semana sem atestado legal, perde o dia de ausência e o pagamento do domingo (DSR)!";
        } else if (lower.includes("insalu") || lower.includes("saude") || lower.includes("nocivo")) {
          res = "🇧🇷 [TRADUÇÃO DE CONCEITO] 'Adicional de Insalubridade': Pago em 10%, 20% ou 40% do salário mínimo por exposição crônica a agentes que prejudicam a saúde (calor/frio, barulho excessivo).";
        } else if (lower.includes("perig") || lower.includes("morte") || lower.includes("choque")) {
          res = "🇧🇷 [TRADUÇÃO DE CONCEITO] 'Adicional de Periculosidade': Adicional fixo de 30% sobre o salário bruto devido ao risco de morte imediata (alta tensão, inflamáveis).";
        } else {
          res = "🇧🇷 [TRADUÇÃO DE CONCEITO] Use termos claros ao preencher o e-Social. Dica: sempre audite a integridade dos CRMs de atestados médicos para afastar fraudes de absenteísmo.";
        }
      }
      
      setCustomTranslation(res);
      setTranslating(false);
    }, 700);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in font-sans">
      
      {/* HEADER SECTION */}
      <div className="glass-panel p-6 rounded-2xl border border-sky-500/15 bg-gradient-to-br from-slate-900/60 to-indigo-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-sky-500/10 px-3 py-1 text-[10px] rounded-bl text-sky-400 font-bold uppercase tracking-wider font-mono">
          {appLanguage === "en" ? "CLT BILINGUAL SUPPORT" : "MÓDULO BILINGUE CLT"}
        </div>

        <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-100 tracking-tight flex items-center gap-2">
              <Languages className="w-5 h-5 text-sky-400 rotate-6" />
              <span>
                {appLanguage === "en" 
                  ? "CLT Technical Glossary & Language Switcher" 
                  : "Dicionário de Termos Técnicos CLT & Chaveador"}
              </span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              {appLanguage === "en"
                ? "Brazilian labor laws (CLT) use highly specific terminology (like FGTS, DSR, Insalubridade, TRCT). This center lets you understand terms paired in Portuguese and English, facilitating training!"
                : "A legislação trabalhista brasileira (CLT) possui nomes complexos e técnicos. Este painel permite que sua aluna que lê em inglês ou novos profissionais entendam de forma dual cada conceito-chave de RH!"}
            </p>
          </div>

          {/* Core transform control */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5 space-y-2 flex-shrink-0 w-full md:w-auto">
            <span className="text-[10px] text-text-secondary font-mono tracking-wider block font-bold uppercase text-center md:text-left">
              {appLanguage === "en" ? "SYSTEM LANGUAGE:" : "IDIOMA DO APP:"}
            </span>
            <div className="flex bg-slate-900 p-1 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => {
                  onChangeLanguage("pt");
                  const toast = document.createElement("div");
                  toast.className = "fixed bottom-5 right-5 z-[20000] bg-slate-900 text-white p-3.5 rounded-lg text-xs font-bold border border-white/10 shadow-2xl animate-fade-in";
                  toast.textContent = "🇧🇷 Idioma do site alterado para Português";
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 2500);
                }}
                className={`px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  appLanguage === "pt"
                    ? "bg-slate-950 border border-white/10 text-white font-bold"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🇧🇷 Português
              </button>
              <button
                type="button"
                onClick={() => {
                  onChangeLanguage("en");
                  const toast = document.createElement("div");
                  toast.className = "fixed bottom-5 right-5 z-[20000] bg-sky-500 text-slate-950 p-3.5 rounded-lg text-xs font-black border border-sky-450 shadow-2xl animate-bounce";
                  toast.textContent = "🇺🇸 Website language set to English!";
                  document.body.appendChild(toast);
                  setTimeout(() => toast.remove(), 2500);
                }}
                className={`px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                  appLanguage === "en"
                    ? "bg-sky-500 text-slate-950 font-black shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🇺🇸 English
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTIONS TABS NAVIGATION */}
      <div className="flex bg-slate-950/80 p-1 rounded-xl border border-white/5 gap-2 w-full max-w-xl">
        <button
          type="button"
          onClick={() => setActiveSection("dictionary")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === "dictionary"
              ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/10"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 animate-pulse" />
          <span>{appLanguage === "en" ? "Technical Glossary" : "Dicionário CLT"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("resumao")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === "resumao"
              ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/10"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <FileText className="w-3.5 h-3.5 animate-pulse" />
          <span>{appLanguage === "en" ? "Fase 1 Cheat-sheet" : "Resumão de Fórmulas"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection("checklist")}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeSection === "checklist"
              ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg shadow-indigo-500/10"
              : "text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>{appLanguage === "en" ? "Compliance Checklist" : "Checklist Admissão"}</span>
        </button>
      </div>

      {activeSection === "dictionary" && (
        /* TWO COLUMN INTERACTION LAYER */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Dictionary Display Panel (Take 2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              
              {/* Header and filters */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  {appLanguage === "en" ? "CLT Bilingual Cheat-sheet Glossary" : "Glossário Dual-Idioma de Termos CLT"}
                </h3>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                    <input
                      type="text"
                      placeholder={appLanguage === "en" ? "Search glossary..." : "Buscar no termo..."}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-slate-950/60 border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white w-full focus:outline-none focus:border-sky-500 font-mono"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e: any) => setSelectedCategory(e.target.value)}
                    className="bg-slate-950/60 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-gray-300 w-full sm:w-auto cursor-pointer focus:outline-none focus:border-sky-500 font-sans"
                  >
                    <option value="all">{appLanguage === "en" ? "All Categories" : "Todas as Áreas"}</option>
                    <option value="Vínculo">{appLanguage === "en" ? "Linkage / Vínculo" : "Vínculo"}</option>
                    <option value="Verbas">{appLanguage === "en" ? "Payments / Verbas" : "Verbas & Descontos"}</option>
                    <option value="Saúde & Afastamento">{appLanguage === "en" ? "Health & Danger" : "Saúde & Afastamento"}</option>
                    <option value="Padrão CLT">{appLanguage === "en" ? "CLT General Standards" : "Padrão CLT Geral"}</option>
                  </select>
                </div>
              </div>

              {/* List and expansion grids */}
              <div className="space-y-3.5 max-h-[440px] overflow-y-auto pr-1">
                {filteredItems.map((item, idx) => {
                  return (
                    <div 
                      key={idx} 
                      className="p-4 rounded-xl bg-slate-950/30 border border-white/5 hover:border-white/10 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2 flex-wrap">
                        <h4 className="font-bold text-sm text-sky-400 font-sans tracking-tight">
                          {item.term}
                        </h4>
                        <span className="text-[9px] bg-slate-900 text-gray-500 px-2 py-0.5 rounded border border-white/5 font-mono">
                          {item.category}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 font-sans text-xs">
                        {/* Normal CLT card side */}
                        <div className="p-3 rounded-lg bg-black/15 border border-white/5 space-y-1">
                          <span className="text-[9px] text-gray-500 font-mono uppercase tracking-widest block font-bold">🇧🇷 Definição em Português:</span>
                          <p className="text-gray-300 leading-normal text-[11.5px]">
                            {item.ptDefinition}
                          </p>
                        </div>

                        {/* English translated Side */}
                        <div className="p-3 rounded-lg bg-indigo-950/15 border border-indigo-500/10 space-y-1 relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-sky-500/10 px-1.5 py-0.2 rounded-bl text-[7.5px] font-mono font-bold text-sky-400">
                            ENGLISH 🇺🇸
                          </div>
                          <span className="text-[9px] text-indigo-400 font-mono uppercase tracking-widest block font-bold">🇺🇸 English Translation & Concept:</span>
                          <p className="text-gray-100 font-semibold leading-normal text-[11.5px]">
                            {item.enDefinition}
                          </p>
                        </div>
                      </div>

                      {/* Analogy tag block */}
                      <div className="text-[11px] text-amber-500 bg-amber-500/5 p-2 rounded-lg border border-amber-500/10 font-mono flex gap-1.5 items-start">
                        <span className="text-amber-400 font-bold block select-none">💡 {appLanguage === "en" ? "Practical Analogy:" : "Analogia Prática:"}</span>
                        <p className="text-gray-300 italic">
                          {appLanguage === "en" ? item.analogyEn : item.analogyPt}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {filteredItems.length === 0 && (
                  <div className="py-12 text-center border border-dashed border-white/5 rounded-xl text-text-secondary text-xs font-mono space-y-1">
                    <AlertCircle className="w-5 h-5 mx-auto text-yellow-500/80 mb-2" />
                    <p>{appLanguage === "en" ? "No technical terms found." : "Nenhum termo técnico coincide com a sua busca."}</p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Translation simulator side widget (1 column) */}
          <div className="space-y-6">
            
            {/* Interactive Translation playground simulator card */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
              <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest border-b border-white/5 pb-2.5 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-accent-primary animate-pulse" />
                {appLanguage === "en" ? "Term Exploiter Lookup" : "Consultório de Conceitos"}
              </h3>

              <p className="text-xs text-text-secondary leading-normal">
                {appLanguage === "en" 
                  ? "Type a specific CLT term or word (e.g. DSR, Onerosidade, Perigosidade) to see a concept translation:" 
                  : "Digite alguma verba, imposto ou palavra CLT para obter o resumo conceitual explicativo:"}
              </p>

              <div className="space-y-3">
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  rows={3}
                  placeholder={appLanguage === "en" ? "Ex: What is DSR, or Onerosidade?" : "Ex: DSR, onerosidade, insalubridade, periculosidade..."}
                  className="w-full bg-slate-950/40 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-550 focus:outline-none focus:border-sky-500 focus:bg-slate-900 leading-normal font-sans"
                />

                <button
                  type="button"
                  onClick={handleTranslateCustom}
                  disabled={translating || !customInput.trim()}
                  className={`w-full py-2 rounded-xl text-xs font-bold uppercase cursor-pointer flex items-center justify-center gap-1.5 transition-all text-slate-100 ${
                    customInput.trim() 
                      ? "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500" 
                      : "bg-slate-800 opacity-40 cursor-not-allowed text-gray-550 font-normal"
                  }`}
                >
                  {translating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> {appLanguage === "en" ? "Consulting..." : "Processando..."}
                    </>
                  ) : (
                    <>
                      <ArrowRight className="w-3.5 h-3.5" /> {appLanguage === "en" ? "Translate Term" : "Explicar Conceito"}
                    </>
                  )}
                </button>
              </div>

              {/* Translation Output render */}
              {customTranslation && (
                <div className="p-3.5 rounded-xl bg-sky-950/20 border border-sky-500/20 text-xs animate-fade-in text-left space-y-1 leading-relaxed font-sans text-gray-100">
                  {customTranslation}
                </div>
              )}
            </div>

            {/* Real Sentence Comparison panel */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
                <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1">
                  <Quote className="w-3.5 h-3.5 text-emerald-400" /> {appLanguage === "en" ? "Phrase Bilingual Cases" : "Casos de Frases Dual-Idioma"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setActiveSimulationIndex(prev => (prev + 1) % JARGON_SIMULATIONS.length);
                  }}
                  className="text-[10px] text-sky-400 hover:text-sky-305 flex items-center gap-1 cursor-pointer font-mono font-bold"
                >
                  {appLanguage === "en" ? "Next" : "Próxima"} <RefreshCw className="w-2.5 h-2.5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 px-2 py-0.5 rounded font-mono font-bold">
                  {appLanguage === "en" ? JARGON_SIMULATIONS[activeSimulationIndex].contextEn : JARGON_SIMULATIONS[activeSimulationIndex].contextPt}
                </span>

                <div className="space-y-2.5 leading-relaxed font-sans">
                  {/* Formal version */}
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-gray-500 font-mono font-bold uppercase block">👔 🇧🇷 CLT Formal:</span>
                    <p className="p-3 rounded-xl bg-black/15 text-gray-300 border border-white/5 leading-normal">
                      "{JARGON_SIMULATIONS[activeSimulationIndex].formalPt}"
                    </p>
                  </div>

                  {/* Simplified Slang version */}
                  <div className="space-y-1">
                    <span className="text-[9.5px] text-sky-400 font-mono font-bold uppercase block">🇺🇸 English Equivalent:</span>
                    <p className="p-3 rounded-xl bg-sky-950/15 text-sky-200 border border-sky-500/10 font-medium leading-normal">
                      "{JARGON_SIMULATIONS[activeSimulationIndex].engTrans}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {activeSection === "resumao" && (
        <div id="clt-formulas-cheatsheet" className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 text-left animate-fade-in">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-sky-400" />
              <span>
                {appLanguage === "en" 
                  ? "Phase 1 - Essential Labor Math Formulas (Bilingual)" 
                  : "Fase 1 - Fórmulas de Cálculos Trabalhistas Essenciais"}
              </span>
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              {appLanguage === "en"
                ? "This complete formula log provides quick references for all core Phase 1 HR math. Check standard equations and examples easily."
                : "Este resumo de cálculos traz as fórmulas oficiais e exemplos da Fase 1 para te guiar na folha de pagamentos CLT."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                titlePt: "Salário Proporcional",
                titleEn: "Proportional Base Salary",
                formula: "(Salário ÷ 30) × Dias trabalhados no mês",
                examplePt: "Exemplo para 15 dias trabalhados com base de R$ 2.034,54: (2.034,54 ÷ 30) × 15 = R$ 1.017,27",
                exampleEn: "Example for working 15 days in a 30-day month with base R$ 2,034.54: (2,034.54 ÷ 30) × 15 = R$ 1,017.27",
                tipPt: "Sempre compute o saldo de dias reais trabalhados no ciclo de admissão ou demissão.",
                tipEn: "Always split down to the exact active calendar days in the hire or termination month."
              },
              {
                titlePt: "Hora Normal (Divisor 200)",
                titleEn: "Normal Hourly Rate (Divisor 200)",
                formula: "Salário-Base ÷ Divisor correspondente (220, 200 ou 180)",
                examplePt: "Exemplo para salário de R$ 2.034,54 com 40h semanais (Divisor 200): 2.034,54 ÷ 200 = R$ 10,17 por hora",
                exampleEn: "Example for R$ 2,034.54 salary on a 40h workweek (Divisor 200): 2,034.54 ÷ 200 = R$ 10.17 per hour",
                tipPt: "Divisor 220 aplica-se para 44h semanais, 200 para 40h semanais, e 180 para 36h semanais.",
                tipEn: "Divisor 220 is for 44h/week, 200 is for 40h/week, and 180 is for 36h/week shifts."
              },
              {
                titlePt: "Horas Extras 50% (Dias Úteis)",
                titleEn: "Overtime 50% (Weekdays)",
                formula: "Valor Hora Normal × 1.5 × Quantidade de Horas Extras",
                examplePt: "Exemplo para 10 horas extras de R$ 10,17: 10 × (10,17 × 1,5) = R$ 152,60",
                exampleEn: "Example for 10 overtime hours with base of R$ 10.17: 10 × (10.17 × 1.5) = R$ 152.60",
                tipPt: "O adicional de 50% é o limite mínimo constitucional para expediente estendido habitual.",
                tipEn: "50% represents the minimum constitutional premium over the normal hourly rate."
              },
              {
                titlePt: "Horas Extras 100% (Dom/Feriados)",
                titleEn: "Overtime 100% (Sundays/Holidays)",
                formula: "Valor Hora Normal × 2.0 × Quantidade de Horas Extras",
                examplePt: "Exemplo para 5 horas extras de R$ 10,17: 5 × (10,17 × 2,0) = R$ 101,70",
                exampleEn: "Example for 5 overtime hours with base of R$ 10.17: 5 × (10.17 × 2.0) = R$ 101.70",
                tipPt: "Aplicável a domingos e feriados federais/municipais sem compensação de folga programada.",
                tipEn: "Applied on Sundays and national holidays without subsequent compensatory rest."
              },
              {
                titlePt: "DSR sobre Variáveis (Horas Extras/Comissão)",
                titleEn: "DSR on Variable Earnings (OT/Commissions)",
                formula: "(Soma das Variáveis ÷ Dias Úteis) × (Domingos + Feriados)",
                examplePt: "Fórmula conceitual: Total das verbas variáveis recebidas no período dividido pelo número de dias úteis (dias de trabalho), e o resultado multiplicado pelo número de repousos (domingos e feriados).",
                exampleEn: "Conceptual example: Total variable earnings received in the month divided by the number of working business days, and the result multiplied by the total rest days (Sundays and holidays).",
                tipPt: "Sábados contam como dia útil de trabalho comercial para DSR sob a Lei de Repousos.",
                tipEn: "Saturdays count as business days of commercial labor for variable DSR calculations."
              },
              {
                titlePt: "13º Salário Proporcional",
                titleEn: "Proportional 13th Salary (Accrual)",
                formula: "(Remuneração de base ÷ 12) × Meses trabalhados no ano civil (superior a 14 dias/mês)",
                examplePt: "Exemplo para R$ 2.034,54 e 8 meses trabalhados (Maio a Dezembro): (2.034,54 ÷ 12) × 8 = R$ 1.356,36",
                exampleEn: "Example for R$ 2,034.54 with 8 active months (hired in May): (2,034.54 ÷ 12) × 8 = R$ 1,356.36",
                tipPt: "Qualquer ciclo com 15 ou mais dias de serviço ativo no mês garante os avos (1/12) correspondentes.",
                tipEn: "Any calendar month with 15 or more active working days scores a full proportional split (1/12)."
              },
              {
                titlePt: "Férias Integrais (+ 1/3 Constitucional)",
                titleEn: "Full Vacation Payout (+ 1/3)",
                formula: "Remuneração de base × 1.3333",
                examplePt: "Exemplo para salário de R$ 2.034,54 sem horas extras: 2.034,54 × 1,3333 = R$ 2.712,72",
                exampleEn: "Example for base salary R$ 2,034.54 without OT values: 2,034.54 × 1.3333 = R$ 2,712.72",
                tipPt: "O terço constitucional (1/3) incide sobre todas as verbas salariais e médias de férias.",
                tipEn: "The constitutional 1/3 third applies to all vacation wage composites including averages."
              },
              {
                titlePt: "Férias Proporcionais (+ 1/3)",
                titleEn: "Proportional Vacation (+ 1/3)",
                formula: "((Salário-Base ÷ 12) × Meses ativos no ciclo) × 1.3333",
                examplePt: "Exemplo para R$ 2.034,54 com 7 meses ativos no período aquisitivo: (2.034,54 ÷ 12 × 7) × 1,3333 = R$ 1.582,42",
                exampleEn: "Example for R$ 2,034.54 base with 7 months active: (2,034.54 ÷ 12 × 7) × 1.3333 = R$ 1,582.42",
                tipPt: "Férias vencidas dão direito ao pagamento em dobro caso ultrapasse o limite concessivo.",
                tipEn: "Unconceded accrued vacations beyond the 12-month limit double the employer's penalty pay under CLT."
              },
              {
                titlePt: "INSS do Funcionário (Progressivo)",
                titleEn: "INSS Social Security (Employee Slice)",
                formula: "Soma ponderada progressivamente por faixas salariais oficiais (7,5% a 14% em 2026)",
                examplePt: "Exemplo para base de R$ 2.274,54: Faixa 1 (1.621 × 7,5%) + Faixa 2 ((2.274.54 - 1.621) × 9%) = R$ 180,39",
                exampleEn: "Example for contribution base R$ 2,274.54: Bracket 1 (1,621 × 7.5%) + Bracket 2 (653.54 × 9%) = R$ 180.39",
                tipPt: "Descontado do holerite respeitando o teto máximo legal de arrecadação do governo.",
                tipEn: "Directly deducted from the employee paycheck monthly, capping out at the maximum regulatory ceiling."
              },
              {
                titlePt: "FGTS Mensal (Poupança)",
                titleEn: "Monthly FGTS (Employer Burden)",
                formula: "Total de Proventos do Mês × 0.08",
                examplePt: "Exemplo para R$ 2.274,54 total de proventos: 2.274,54 × 0,08 = R$ 181,96 de depósito regular",
                exampleEn: "Example for R$ 2,274.54 aggregate paycheck provents: 2,274.54 × 0.08 = R$ 181.96 deposit amount",
                tipPt: "Trata-se de despesa exclusiva da empresa. Não incide nenhum desconto sobre o holerite do empregado.",
                tipEn: "Never deducted from salary! It is a pure employer payroll burden deposited at Caixa Federal."
              },
              {
                titlePt: "Desconto de Vale-Transporte",
                titleEn: "Transit Voucher Max Discount",
                formula: "Menor valor entre 6% do Salário-Base contratual ou Valor total de passes fornecidos",
                examplePt: "Exemplo para base de R$ 2.034,54: limite de desconto de R$ 122,07. Se gastou R$ 100 de vale, desconta só R$ 100,00.",
                exampleEn: "Example for base R$ 2,034.54: 6% ceiling is R$ 122.07. If actual cost is R$ 100, only discount the R$ 100.00.",
                tipPt: "Para obter 0% de desconto, o colaborador deve preencher a recusa formal de concessão de passes.",
                tipEn: "Declining the transit voucher results in a signed statement and zero deductions (0%)."
              }
            ].map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950/40 border border-white/5 space-y-3 flex flex-col justify-between hover:border-sky-505/20 transition-all">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono tracking-widest text-sky-400 bg-sky-500/10 border border-sky-500/10 px-2 py-0.5 rounded font-bold uppercase inline-block">
                    {item.titlePt} / {item.titleEn}
                  </span>
                  <div className="bg-black/20 p-2.5 rounded border border-white/5 font-mono text-[11px] text-emerald-400 mt-1">
                    <span className="text-[10px] text-gray-500 block font-bold uppercase font-sans mb-0.5">Fórmula / Equation:</span>
                    {item.formula}
                  </div>
                  <div className="text-[11px] font-sans text-gray-300 leading-normal whitespace-pre-line mt-2 italic font-medium p-2 bg-indigo-950/10 border border-indigo-500/5 rounded">
                    <span className="text-[10px] text-indigo-400 block font-bold uppercase font-mono font-bold font-sans not-italic mb-0.5">Cálculo Prático / Example:</span>
                    {appLanguage === "en" ? item.exampleEn : item.examplePt}
                  </div>
                </div>

                <div className="text-[10px] text-amber-500 bg-amber-500/5 border border-amber-500/10 p-2 rounded leading-tight">
                  <span className="font-bold underline block mr-1 select-none">💡 CLIPS TIP:</span>
                  {appLanguage === "en" ? item.tipEn : item.tipPt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === "checklist" && (
        <div id="admissions-compliance-cheatsheet" className="glass-panel p-6 rounded-2xl border border-white/5 space-y-6 text-left animate-fade-in font-sans">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 gap-3">
            <div>
              <h3 className="text-base font-bold text-gray-100 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-405" />
                <span>
                  {appLanguage === "en" 
                    ? "Phase 1 - Admissions Audit & Onboarding Compliance Checklist" 
                    : "Fase 1 - Checklist de Compliance e Auditoria Admissional de RH"}
                </span>
              </h3>
              <p className="text-xs text-text-secondary mt-1">
                {appLanguage === "en"
                  ? "As an HR intern, you must cross-check these 9 critical checkpoints on every employee admission registry."
                  : "Como estagiário de RH, certifique-se de auditar estes 9 pontos de conformidade legal de cada eSocial (S-2200)."}
              </p>
            </div>
            <div className="p-2 bg-slate-950/80 rounded-lg text-xs font-mono border border-white/5 text-center flex-shrink-0">
              <span className="text-text-secondary block font-bold uppercase text-[9px]">Progresso / Progress</span>
              <span className="text-emerald-400 font-bold text-sm">
                {Object.values(checkedItems).filter(Boolean).length} / 9 Concluídos
              </span>
            </div>
          </div>

          {/* Checklist progress bar */}
          <div className="w-full bg-slate-950/70 h-2.5 rounded-full overflow-hidden border border-white/5">
            <div 
              className="bg-gradient-to-r from-emerald-500 to-sky-505 h-full transition-all duration-300" 
              style={{ width: `${(Object.values(checkedItems).filter(Boolean).length / 9) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                id: "cpf",
                titlePt: "1. CPF (Cadastro de Pessoas Físicas)",
                titleEn: "1. CPF (Taxpayer Registry)",
                checkPt: "Auditar se está regularizado e se o nome completo civil bate idêntico com o RG para evitar rebatimentos judiciais ou recusa do governo.",
                checkEn: "Audit registry consistency to avoid transmission blocks on the government revenue database."
              },
              {
                id: "ctps",
                titlePt: "2. CTPS Digital & PIS",
                titleEn: "2. Digital CTPS & PIS Number",
                checkPt: "Validar série, número e se PIS/NIT existem e estão ativos antes de declarar a admissão de dados no eSocial.",
                checkEn: "Validate work card serial number and active PIS identification before S-2200 submissions."
              },
              {
                id: "aso",
                titlePt: "3. ASO Admissional",
                titleEn: "3. Occupational Medical Certificate (ASO)",
                checkPt: "O exame clínico deve estar assinado pelo médico examinador e executado ANTES do início do serviço físico do colaborador.",
                checkEn: "Physical health certification must be fully customized and signed prior to the active beginning on operations."
              },
              {
                id: "dependentes",
                titlePt: "4. Dependentes de IRRF e Salário Família",
                titleEn: "4. Dependents Declaration (Tax/Salary)",
                checkPt: "Exigir certidões de nascimento ou guardas. Cada dependente confere R$ 189,59 fixos deduzidos na base tributável do Imposto de Renda mensal.",
                checkEn: "Require official birth certificate logs. Direct kids subtract legal tax burdens from progressive brackets."
              },
              {
                id: "vt",
                titlePt: "5. Declaração de Vale-Transporte",
                titleEn: "5. Transit Voucher Opt-in forms",
                checkPt: "Coletar o Termo assinado descrevendo as conduções diárias necessárias ou indicando a recusa do passes (desconto fixado em máximo de 6% do salário).",
                checkEn: "Must gather signed declarations of daily trips or declining forms (strictly capped up to 6% raw base wage)."
              },
              {
                id: "salario",
                titlePt: "6. Salário-Base da Categoria",
                titleEn: "6. Sector Minimum Floor Alignment",
                checkPt: "Coordenar o salário nominal com pisos sindicais vigentes, acordos coletivos (CCT) ou salário mínimo regional nacional.",
                checkEn: "Synchronize raw base hiring salary with active local trade union minimum floor rates."
              },
              {
                id: "jornada",
                titlePt: "7. Divisor de Jornada de Trabalho",
                titleEn: "7. Divisor Config & Weekly Schedule",
                checkPt: "Fomentar no sistema se a carga horária aplica divisor 220 (44h semanais), divisor 200 (40h semanais) ou divisor 180 (36h semanais).",
                checkEn: "Input standard workweek schedule metrics: Divisor 220 (44h), 200 (40h) or 180 (36h/special)."
              },
              {
                id: "admissao",
                titlePt: "8. Data de Admissão Sincronizada",
                titleEn: "8. Synced Hiring Dates",
                checkPt: "Certificar-se de cadastrar a data idêntica do início de expediente oficial em todos os controles internos de relógio de ponto.",
                checkEn: "Enforce fully identical contractual start date variables into payroll software and clock systems."
              },
              {
                id: "cbo",
                titlePt: "9. Código CBO de 6 Dígitos",
                titleEn: "9. Correct occupational CBO standard code",
                checkPt: "Buscar a Classificação Brasileira de Ocupações apropriada para a função exercida. CBO errado gera multas severas do Ministério do Trabalho.",
                checkEn: "Classify worker role correctly using regional occupational catalog codes. Incorrect definitions trigger hefty audit penalties."
              }
            ].map((item) => {
              const isChecked = !!checkedItems[item.id];
              return (
                <div 
                  key={item.id} 
                  onClick={() => {
                    setCheckedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }));
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex gap-3.5 items-start ${
                    isChecked 
                      ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300" 
                      : "bg-slate-950/40 border-white/5 hover:border-white/10 text-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly
                    className="w-4 h-4 rounded border-white/10 text-emerald-500 bg-slate-950 focus:ring-emerald-500 cursor-pointer accent-emerald-550 shrink-0 mt-0.5"
                  />
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs tracking-tight">
                      {appLanguage === "en" ? item.titleEn : item.titlePt}
                    </h4>
                    <p className={`text-[11px] leading-relaxed ${isChecked ? "text-emerald-400" : "text-text-secondary"}`}>
                      {appLanguage === "en" ? item.checkEn : item.checkPt}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-3 bg-indigo-950/15 border border-indigo-500/10 rounded-xl flex gap-2 items-start text-xs text-indigo-300 leading-normal">
            <Settings className="w-4 h-4 shrink-0 mt-0.5 animate-spin" />
            <p>
              {appLanguage === "en" 
                ? "Bilingual Compliance Notice: Completing these steps ensures the mock S-2200 event parses with 0 errors on regulatory mock databases. Work with clean logs!"
                : "Aviso de Compliance: Completar todos os pontos deste checklist garante que as admissões fiquem redondas no eSocial, mitigando riscos de fiscalizações!"}
            </p>
          </div>
        </div>
      )}

    </div>
  );
}

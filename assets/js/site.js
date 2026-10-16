/* BrightScale Remodeling — language, menu, hero plan, estimator, cookie consent */
(function () {
  "use strict";

  /* ---------- Copy (EN / ES / PT) ---------- */
  var T = {
    en: {
      "skip": "Skip to content",
      "nav.services": "Services",
      "nav.method": "Smart Remodeling",
      "nav.estimate": "Price range",
      "nav.contact": "Contact",
      "nav.call": "Call 954-553-9535",
      "nav.menu": "Menu",
      "hero.kicker": "Bathroom, kitchen and floor remodeling in Broward and Palm Beach",
      "hero.title": "Your remodel, planned before the first tile comes off.",
      "hero.lead": "BrightScale Remodeling scopes, schedules and runs your project from the first visit to the final walkthrough, with one point of contact and a progress page you can check any time.",
      "hero.call": "Call Brighty",
      "hero.callsub": "954-553-9535",
      "hero.estimate": "See a price range",
      "hero.note": "Brighty is our virtual assistant. It answers 24/7 in English, Spanish and Portuguese and books your visit.",
      "plan.caption1": "Primary bath, 8′ × 10′",
      "plan.caption2": "Plan → finished room",
      "plan.replay": "Replay",
      "svc.title": "What we build and fix",
      "svc.lead": "Most of our work is remodeling. We also take on the repairs and finishes that make a house feel done.",
      "svc.bath": "Bathroom remodeling",
      "svc.bath.d": "Tub-to-shower conversions, tile, vanities, fixtures and full gut renovations.",
      "svc.kitchen": "Kitchen remodeling",
      "svc.kitchen.d": "Cabinets, countertops, backsplash, lighting and layout changes.",
      "svc.floor": "Flooring",
      "svc.floor.d": "Tile, luxury vinyl and laminate, including demolition of the old floor and leveling.",
      "svc.more": "Repairs and finishes",
      "svc.handyman": "Handyman & repairs",
      "svc.handyman.d": "Doors, fixtures, mounting, small fixes",
      "svc.paint": "Painting",
      "svc.paint.d": "Interior and exterior",
      "svc.drywall": "Drywall & texture",
      "svc.drywall.d": "Patches, new walls, ceilings",
      "svc.plumb": "Plumbing installation",
      "svc.plumb.d": "Fixtures, faucets, toilets, vanities",
      "svc.wash": "Pressure washing",
      "svc.wash.d": "Driveways, patios, walls (no softwash)",
      "svc.epoxy": "Garage floor epoxy",
      "svc.epoxy.d": "Prep, coating and flake finish",
      "svc.demo": "Selective demolition",
      "svc.demo.d": "Careful removal before a remodel",
      "svc.art": "Art & mirror installation",
      "svc.art.d": "Handling and hanging large pieces",
      "svc.wood": "Wood grain & stain finishes",
      "svc.wood.d": "Garage doors, doors and trim",
      "svc.water": "Water damage reconstruction",
      "svc.water.d": "Rebuilding after mitigation",
      "smart.title": "Smart Remodeling: how every project runs",
      "smart.lead": "Five principles we apply from the first visit, so you know what is being built, with what, and when.",
      "smart.s": "Scope", "smart.s.d": "The work, deliverables and expectations are defined in writing before anything starts.",
      "smart.m": "Model", "smart.m.d": "We agree on a reference for materials, finishes and workmanship, so “done” means the same thing to both of us.",
      "smart.a": "Alignment", "smart.a.d": "Your goals, the crew’s responsibilities and material availability sit on one shared plan.",
      "smart.r": "Rhythm", "smart.r.d": "A steady workflow with regular progress reviews and updates you don’t have to chase.",
      "smart.t": "Time", "smart.t.d": "A realistic schedule with clear milestones, and deadlines we actively manage.",
      "smart.tag": "A clear plan. A defined standard. A better remodeling experience.",
      "est.title": "Get a price range in a minute",
      "est.lead": "Choose the project, size and finish level. You get a starting range; the exact price comes in a written proposal after a visit.",
      "est.type": "Project",
      "est.bath": "Bathroom", "est.kitchen": "Kitchen", "est.floor": "Flooring",
      "est.size": "Size",
      "est.finish": "Finish level",
      "est.std": "Standard", "est.up": "Upgraded", "est.prem": "Premium",
      "est.out": "Starting range",
      "est.for": "for about",
      "est.sqft": "sq ft",
      "est.inc1": "Labor, materials at the chosen level and cleanup",
      "est.inc2": "Permits and licensed trades when the work requires them",
      "est.inc3": "Final price confirmed in a written proposal",
      "est.cta": "Book a visit",
      "est.placeholder": "Preview only: these are sample ranges. BrightScale’s real ranges will replace them before the site goes live.",
      "trk.title": "Follow your project from your phone",
      "trk.lead": "Every client gets a private progress page: phases, photos from the site and what happens next. No chasing anyone for an update.",
      "trk.example": "Example project",
      "trk.job": "Guest bath remodel",
      "trk.where": "Coral Springs",
      "trk.p1": "Scope and selections approved", "trk.p2": "Demolition", "trk.p3": "Plumbing and waterproofing", "trk.p4": "Tile and vanity", "trk.p5": "Final walkthrough",
      "trk.done": "Done", "trk.now": "In progress", "trk.next": "Next",
      "trk.point1": "Photos and notes after every work day",
      "trk.point2": "Phases with dates, updated by the project manager",
      "trk.point3": "Payments tied to finished phases",
      "about.title": "Run like a project, not a side job",
      "about.lead": "BrightScale was founded by a construction project manager who has delivered renovations on more than 2,500 multifamily units in South Florida. Your bathroom gets the same scope control, scheduling and crew coordination.",
      "about.areas": "We work across Broward and Palm Beach counties, including:",
      "lic.title": "About licensing",
      "lic.text": "BrightScale Remodeling is a trade name of BrightScale Group LLC, which plans and manages your project. Work that requires a Florida license is performed by Florida-licensed contractors, and their license numbers appear on your written proposal.",
      "ct.title": "Start with a call or a message",
      "ct.lead": "Tell us about the project. We’ll set up a visit at a time that works for you.",
      "ct.call": "Call Brighty, our virtual assistant", "ct.call.d": "954-553-9535 · 24/7 · EN / ES / PT",
      "ct.mail": "Email the team", "ct.mail.d": "contact@brightscalegroup.com",
      "ct.form": "Request a visit",
      "f.name": "Name", "f.phone": "Mobile phone", "f.email": "Email", "f.zip": "ZIP code",
      "f.type": "Project", "f.choose": "Choose one", "f.other": "Something else",
      "f.when": "When do you want to start?", "f.asap": "As soon as possible", "f.month": "Within a month", "f.plan": "Just planning",
      "f.desc": "Tell us about the project",
      "f.sms": "I agree to receive text messages from BrightScale Remodeling (BrightScale Group LLC) about my request, appointments and project updates. Message frequency varies. Message and data rates may apply. Reply HELP for help or STOP to opt out. Consent is not a condition of purchase. See our <a href=\"sms-terms.html\">SMS Terms</a> and <a href=\"privacy-policy.html\">Privacy Policy</a>.",
      "f.send": "Request my visit",
      "f.fine": "We use your details only to answer this request. We never sell or share your phone number with third parties for marketing.",
      "ft.tag": "Bathroom, kitchen and floor remodeling in South Florida.",
      "ft.company": "Company", "ft.legal": "Legal",
      "ft.privacy": "Privacy Policy", "ft.terms": "Terms of Service", "ft.sms": "SMS Terms",
      "ft.rights": "BrightScale Remodeling is a trade name of BrightScale Group LLC.",
      "ck.text": "We use cookies for analytics and ads only if you allow it.",
      "ck.ok": "Allow", "ck.no": "Decline", "ck.more": "Privacy Policy",
      "legal.note": "This page is in English. Spanish and Portuguese versions are available on request."
    },
    es: {
      "skip": "Ir al contenido",
      "nav.services": "Servicios",
      "nav.method": "Smart Remodeling",
      "nav.estimate": "Rango de precio",
      "nav.contact": "Contacto",
      "nav.call": "Llamar 954-553-9535",
      "nav.menu": "Menú",
      "hero.kicker": "Remodelación de baños, cocinas y pisos en Broward y Palm Beach",
      "hero.title": "Su remodelación, planificada antes de quitar la primera baldosa.",
      "hero.lead": "BrightScale Remodeling define el alcance, programa y dirige su proyecto desde la primera visita hasta la entrega final, con una sola persona de contacto y una página de avance que puede revisar cuando quiera.",
      "hero.call": "Llamar a Brighty",
      "hero.callsub": "954-553-9535",
      "hero.estimate": "Ver un rango de precio",
      "hero.note": "Brighty es nuestra asistente virtual. Atiende 24/7 en inglés, español y portugués y agenda su visita.",
      "plan.caption1": "Baño principal, 8′ × 10′",
      "plan.caption2": "Plano → espacio terminado",
      "plan.replay": "Repetir",
      "svc.title": "Lo que construimos y reparamos",
      "svc.lead": "La mayor parte de nuestro trabajo es remodelación. También hacemos las reparaciones y acabados que dejan la casa lista.",
      "svc.bath": "Remodelación de baños",
      "svc.bath.d": "Cambio de bañera a ducha, azulejos, vanitorios, accesorios y renovaciones completas.",
      "svc.kitchen": "Remodelación de cocinas",
      "svc.kitchen.d": "Gabinetes, encimeras, salpicadero, iluminación y cambios de distribución.",
      "svc.floor": "Pisos",
      "svc.floor.d": "Cerámica, vinilo de lujo y laminado, incluida la demolición del piso anterior y la nivelación.",
      "svc.more": "Reparaciones y acabados",
      "svc.handyman": "Handyman y reparaciones",
      "svc.handyman.d": "Puertas, accesorios, montaje, arreglos",
      "svc.paint": "Pintura",
      "svc.paint.d": "Interior y exterior",
      "svc.drywall": "Drywall y textura",
      "svc.drywall.d": "Parches, paredes nuevas, techos",
      "svc.plumb": "Instalación de plomería",
      "svc.plumb.d": "Accesorios, grifos, inodoros, vanitorios",
      "svc.wash": "Lavado a presión",
      "svc.wash.d": "Entradas, patios, paredes (sin softwash)",
      "svc.epoxy": "Epoxi para piso de garaje",
      "svc.epoxy.d": "Preparación, recubrimiento y acabado con escamas",
      "svc.demo": "Demolición selectiva",
      "svc.demo.d": "Retiro cuidadoso antes de remodelar",
      "svc.art": "Instalación de arte y espejos",
      "svc.art.d": "Manejo y colgado de piezas grandes",
      "svc.wood": "Acabados imitación madera y tinte",
      "svc.wood.d": "Puertas de garaje, puertas y molduras",
      "svc.water": "Reconstrucción por daños de agua",
      "svc.water.d": "Reconstrucción después de la mitigación",
      "smart.title": "Smart Remodeling: cómo funciona cada proyecto",
      "smart.lead": "Cinco principios que aplicamos desde la primera visita, para que sepa qué se construye, con qué y cuándo.",
      "smart.s": "Alcance", "smart.s.d": "El trabajo, los entregables y las expectativas quedan por escrito antes de empezar.",
      "smart.m": "Modelo", "smart.m.d": "Acordamos una referencia de materiales, acabados y mano de obra, para que “terminado” signifique lo mismo para ambos.",
      "smart.a": "Alineación", "smart.a.d": "Sus objetivos, las responsabilidades del equipo y la disponibilidad de materiales en un solo plan compartido.",
      "smart.r": "Ritmo", "smart.r.d": "Un flujo de trabajo constante con revisiones de avance y actualizaciones sin que tenga que pedirlas.",
      "smart.t": "Tiempo", "smart.t.d": "Un cronograma realista con hitos claros y plazos que gestionamos activamente.",
      "smart.tag": "Un plan claro. Un estándar definido. Una mejor experiencia de remodelación.",
      "est.title": "Obtenga un rango de precio en un minuto",
      "est.lead": "Elija el proyecto, el tamaño y el nivel de acabado. Recibe un rango inicial; el precio exacto llega en una propuesta escrita después de la visita.",
      "est.type": "Proyecto",
      "est.bath": "Baño", "est.kitchen": "Cocina", "est.floor": "Pisos",
      "est.size": "Tamaño",
      "est.finish": "Nivel de acabado",
      "est.std": "Estándar", "est.up": "Mejorado", "est.prem": "Premium",
      "est.out": "Rango inicial",
      "est.for": "para unos",
      "est.sqft": "pies²",
      "est.inc1": "Mano de obra, materiales del nivel elegido y limpieza",
      "est.inc2": "Permisos y oficios con licencia cuando el trabajo lo requiere",
      "est.inc3": "Precio final confirmado en una propuesta escrita",
      "est.cta": "Agendar una visita",
      "est.placeholder": "Solo vista previa: estos son rangos de ejemplo. Los rangos reales de BrightScale los reemplazarán antes de publicar el sitio.",
      "trk.title": "Siga su proyecto desde el teléfono",
      "trk.lead": "Cada cliente recibe una página privada de avance: fases, fotos de la obra y los próximos pasos. Sin tener que perseguir a nadie.",
      "trk.example": "Proyecto de ejemplo",
      "trk.job": "Remodelación de baño de visitas",
      "trk.where": "Coral Springs",
      "trk.p1": "Alcance y selecciones aprobados", "trk.p2": "Demolición", "trk.p3": "Plomería e impermeabilización", "trk.p4": "Azulejo y vanitorio", "trk.p5": "Revisión final",
      "trk.done": "Listo", "trk.now": "En curso", "trk.next": "Siguiente",
      "trk.point1": "Fotos y notas después de cada día de trabajo",
      "trk.point2": "Fases con fechas, actualizadas por el gerente de proyecto",
      "trk.point3": "Pagos vinculados a fases terminadas",
      "about.title": "Gestionado como un proyecto, no como un trabajo suelto",
      "about.lead": "BrightScale fue fundada por un gerente de proyectos de construcción que ha entregado renovaciones en más de 2,500 unidades multifamiliares en el sur de Florida. Su baño recibe el mismo control de alcance, programación y coordinación de equipos.",
      "about.areas": "Trabajamos en los condados de Broward y Palm Beach, incluyendo:",
      "lic.title": "Sobre las licencias",
      "lic.text": "BrightScale Remodeling es un nombre comercial de BrightScale Group LLC, que planifica y gestiona su proyecto. Los trabajos que requieren licencia de Florida los realizan contratistas con licencia de Florida, y sus números de licencia aparecen en su propuesta escrita.",
      "ct.title": "Empiece con una llamada o un mensaje",
      "ct.lead": "Cuéntenos sobre el proyecto. Agendamos una visita en el horario que le convenga.",
      "ct.call": "Llame a Brighty, nuestra asistente virtual", "ct.call.d": "954-553-9535 · 24/7 · EN / ES / PT",
      "ct.mail": "Escriba al equipo", "ct.mail.d": "contact@brightscalegroup.com",
      "ct.form": "Solicitar una visita",
      "f.name": "Nombre", "f.phone": "Teléfono móvil", "f.email": "Correo electrónico", "f.zip": "Código postal",
      "f.type": "Proyecto", "f.choose": "Elija uno", "f.other": "Otra cosa",
      "f.when": "¿Cuándo quiere empezar?", "f.asap": "Lo antes posible", "f.month": "Dentro de un mes", "f.plan": "Solo planeando",
      "f.desc": "Cuéntenos sobre el proyecto",
      "f.sms": "Acepto recibir mensajes de texto de BrightScale Remodeling (BrightScale Group LLC) sobre mi solicitud, citas y avances del proyecto. La frecuencia varía. Pueden aplicarse tarifas de mensajes y datos. Responda HELP para ayuda o STOP para cancelar. El consentimiento no es condición de compra. Vea los <a href=\"sms-terms.html\">Términos de SMS</a> y la <a href=\"privacy-policy.html\">Política de Privacidad</a>.",
      "f.send": "Solicitar mi visita",
      "f.fine": "Usamos sus datos solo para responder a esta solicitud. Nunca vendemos ni compartimos su número con terceros para marketing.",
      "ft.tag": "Remodelación de baños, cocinas y pisos en el sur de Florida.",
      "ft.company": "Empresa", "ft.legal": "Legal",
      "ft.privacy": "Política de Privacidad", "ft.terms": "Términos de Servicio", "ft.sms": "Términos de SMS",
      "ft.rights": "BrightScale Remodeling es un nombre comercial de BrightScale Group LLC.",
      "ck.text": "Usamos cookies de análisis y publicidad solo si usted lo permite.",
      "ck.ok": "Permitir", "ck.no": "Rechazar", "ck.more": "Política de Privacidad",
      "legal.note": "Esta página está en inglés. Las versiones en español y portugués están disponibles a pedido."
    },
    pt: {
      "skip": "Ir para o conteúdo",
      "nav.services": "Serviços",
      "nav.method": "Smart Remodeling",
      "nav.estimate": "Faixa de preço",
      "nav.contact": "Contato",
      "nav.call": "Ligar 954-553-9535",
      "nav.menu": "Menu",
      "hero.kicker": "Reforma de banheiros, cozinhas e pisos em Broward e Palm Beach",
      "hero.title": "Sua reforma, planejada antes de tirar o primeiro azulejo.",
      "hero.lead": "A BrightScale Remodeling define o escopo, agenda e conduz sua obra da primeira visita à entrega final, com um único ponto de contato e uma página de acompanhamento que você consulta quando quiser.",
      "hero.call": "Ligar para a Brighty",
      "hero.callsub": "954-553-9535",
      "hero.estimate": "Ver uma faixa de preço",
      "hero.note": "A Brighty é nossa assistente virtual. Atende 24h em inglês, espanhol e português e agenda sua visita.",
      "plan.caption1": "Banheiro da suíte, 8′ × 10′",
      "plan.caption2": "Planta → ambiente pronto",
      "plan.replay": "Repetir",
      "svc.title": "O que construímos e consertamos",
      "svc.lead": "A maior parte do nosso trabalho é reforma. Também fazemos os reparos e acabamentos que deixam a casa pronta.",
      "svc.bath": "Reforma de banheiro",
      "svc.bath.d": "Troca de banheira por box, revestimento, gabinetes, louças e reformas completas.",
      "svc.kitchen": "Reforma de cozinha",
      "svc.kitchen.d": "Armários, bancadas, backsplash, iluminação e mudanças de layout.",
      "svc.floor": "Pisos",
      "svc.floor.d": "Porcelanato, vinílico e laminado, incluindo a retirada do piso antigo e o nivelamento.",
      "svc.more": "Reparos e acabamentos",
      "svc.handyman": "Handyman e reparos",
      "svc.handyman.d": "Portas, acessórios, instalações, pequenos consertos",
      "svc.paint": "Pintura",
      "svc.paint.d": "Interna e externa",
      "svc.drywall": "Drywall e textura",
      "svc.drywall.d": "Remendos, paredes novas, forros",
      "svc.plumb": "Instalação hidráulica",
      "svc.plumb.d": "Louças, torneiras, vasos, gabinetes",
      "svc.wash": "Lavagem com pressão",
      "svc.wash.d": "Calçadas, pátios, paredes (sem softwash)",
      "svc.epoxy": "Epóxi para piso de garagem",
      "svc.epoxy.d": "Preparo, revestimento e acabamento com flocos",
      "svc.demo": "Demolição seletiva",
      "svc.demo.d": "Retirada cuidadosa antes da reforma",
      "svc.art": "Instalação de quadros e espelhos",
      "svc.art.d": "Manuseio e fixação de peças grandes",
      "svc.wood": "Acabamento imitação madeira e stain",
      "svc.wood.d": "Portas de garagem, portas e guarnições",
      "svc.water": "Reconstrução após dano por água",
      "svc.water.d": "Reconstrução depois da mitigação",
      "smart.title": "Smart Remodeling: como cada obra funciona",
      "smart.lead": "Cinco princípios que aplicamos desde a primeira visita, para você saber o que vai ser feito, com quê e quando.",
      "smart.s": "Escopo", "smart.s.d": "O trabalho, as entregas e as expectativas ficam definidos por escrito antes de começar.",
      "smart.m": "Modelo", "smart.m.d": "Combinamos uma referência de materiais, acabamentos e mão de obra, para que “pronto” signifique o mesmo para os dois lados.",
      "smart.a": "Alinhamento", "smart.a.d": "Seus objetivos, as responsabilidades da equipe e a disponibilidade de material em um único plano compartilhado.",
      "smart.r": "Ritmo", "smart.r.d": "Um fluxo de trabalho constante, com revisões de andamento e atualizações sem você precisar cobrar.",
      "smart.t": "Tempo", "smart.t.d": "Um cronograma realista, com marcos claros e prazos gerenciados de perto.",
      "smart.tag": "Um plano claro. Um padrão definido. Uma reforma melhor.",
      "est.title": "Veja uma faixa de preço em um minuto",
      "est.lead": "Escolha o tipo de obra, o tamanho e o nível de acabamento. Você recebe uma faixa inicial; o preço exato vem numa proposta por escrito depois da visita.",
      "est.type": "Obra",
      "est.bath": "Banheiro", "est.kitchen": "Cozinha", "est.floor": "Piso",
      "est.size": "Tamanho",
      "est.finish": "Nível de acabamento",
      "est.std": "Padrão", "est.up": "Superior", "est.prem": "Premium",
      "est.out": "Faixa inicial",
      "est.for": "para cerca de",
      "est.sqft": "pés²",
      "est.inc1": "Mão de obra, materiais do nível escolhido e limpeza",
      "est.inc2": "Licenças e profissionais habilitados quando a obra exige",
      "est.inc3": "Preço final confirmado em proposta por escrito",
      "est.cta": "Agendar uma visita",
      "est.placeholder": "Somente prévia: estas são faixas de exemplo. As faixas reais da BrightScale entram antes de o site ir ao ar.",
      "trk.title": "Acompanhe a obra pelo celular",
      "trk.lead": "Cada cliente recebe uma página privada de acompanhamento: etapas, fotos da obra e os próximos passos. Sem precisar cobrar ninguém.",
      "trk.example": "Obra de exemplo",
      "trk.job": "Reforma do banheiro social",
      "trk.where": "Coral Springs",
      "trk.p1": "Escopo e escolhas aprovados", "trk.p2": "Demolição", "trk.p3": "Hidráulica e impermeabilização", "trk.p4": "Revestimento e gabinete", "trk.p5": "Vistoria final",
      "trk.done": "Concluído", "trk.now": "Em andamento", "trk.next": "Próximo",
      "trk.point1": "Fotos e anotações depois de cada dia de trabalho",
      "trk.point2": "Etapas com datas, atualizadas pelo gerente da obra",
      "trk.point3": "Pagamentos ligados às etapas concluídas",
      "about.title": "Conduzida como projeto, não como bico",
      "about.lead": "A BrightScale foi fundada por um gerente de obras que já entregou reformas em mais de 2.500 unidades residenciais no sul da Flórida. Seu banheiro recebe o mesmo controle de escopo, cronograma e coordenação de equipe.",
      "about.areas": "Atendemos os condados de Broward e Palm Beach, incluindo:",
      "lic.title": "Sobre licenças",
      "lic.text": "BrightScale Remodeling é um nome comercial da BrightScale Group LLC, que planeja e gerencia sua obra. Os serviços que exigem licença na Flórida são executados por empreiteiros licenciados na Flórida, e os números das licenças constam na sua proposta por escrito.",
      "ct.title": "Comece com uma ligação ou uma mensagem",
      "ct.lead": "Conte sobre a obra. Agendamos uma visita no horário que for melhor para você.",
      "ct.call": "Ligue para a Brighty, nossa assistente virtual", "ct.call.d": "954-553-9535 · 24h · EN / ES / PT",
      "ct.mail": "Escreva para a equipe", "ct.mail.d": "contact@brightscalegroup.com",
      "ct.form": "Pedir uma visita",
      "f.name": "Nome", "f.phone": "Celular", "f.email": "E-mail", "f.zip": "ZIP code",
      "f.type": "Obra", "f.choose": "Escolha uma", "f.other": "Outra coisa",
      "f.when": "Quando quer começar?", "f.asap": "O quanto antes", "f.month": "Em até um mês", "f.plan": "Só planejando",
      "f.desc": "Conte sobre a obra",
      "f.sms": "Aceito receber mensagens de texto da BrightScale Remodeling (BrightScale Group LLC) sobre meu pedido, agendamentos e andamento da obra. A frequência varia. Podem ser cobradas tarifas de mensagens e dados. Responda HELP para ajuda ou STOP para cancelar. O consentimento não é condição de compra. Veja os <a href=\"sms-terms.html\">Termos de SMS</a> e a <a href=\"privacy-policy.html\">Política de Privacidade</a>.",
      "f.send": "Pedir minha visita",
      "f.fine": "Usamos seus dados só para responder a este pedido. Nunca vendemos nem compartilhamos seu telefone com terceiros para marketing.",
      "ft.tag": "Reforma de banheiros, cozinhas e pisos no sul da Flórida.",
      "ft.company": "Empresa", "ft.legal": "Jurídico",
      "ft.privacy": "Política de Privacidade", "ft.terms": "Termos de Serviço", "ft.sms": "Termos de SMS",
      "ft.rights": "BrightScale Remodeling é um nome comercial da BrightScale Group LLC.",
      "ck.text": "Usamos cookies de análise e anúncios só se você permitir.",
      "ck.ok": "Permitir", "ck.no": "Recusar", "ck.more": "Política de Privacidade",
      "legal.note": "Esta página está em inglês. Versões em espanhol e português estão disponíveis mediante pedido."
    }
  };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  var params = new URLSearchParams(location.search);
  var lang = params.get("lang") || store("bs-lang") || ((navigator.language || "en").slice(0, 2));
  if (!T[lang]) lang = "en";

  function t(key) { return (T[lang] && T[lang][key]) || T.en[key] || ""; }

  function applyLang(next) {
    lang = T[next] ? next : "en";
    store("bs-lang", lang);
    document.documentElement.lang = lang === "pt" ? "pt-BR" : lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) { el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-html]").forEach(function (el) { el.innerHTML = t(el.dataset.i18nHtml); });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) { el.setAttribute("placeholder", t(el.dataset.i18nPh)); });
    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) { el.setAttribute("aria-label", t(el.dataset.i18nAria)); });
    document.querySelectorAll(".lang button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.lang === lang)); });
    var langField = document.querySelector("input[name=_language]");
    if (langField) langField.value = lang;
    if (window.bsEstimate) window.bsEstimate();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest(".lang button");
    if (b) applyLang(b.dataset.lang);
    var m = e.target.closest(".menu-btn");
    if (m) {
      var nav = document.getElementById("nav");
      var open = nav.classList.toggle("open");
      m.setAttribute("aria-expanded", String(open));
    }
    if (e.target.closest(".nav a")) {
      var n = document.getElementById("nav");
      if (n) n.classList.remove("open");
    }
  });

  /* ---------- Hero: plan → room ---------- */
  function runPlan() {
    var plan = document.querySelector(".plan");
    if (!plan) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    plan.querySelectorAll(".draw").forEach(function (p) {
      try { p.style.setProperty("--len", Math.ceil(p.getTotalLength())); } catch (e) {}
    });
    plan.classList.remove("go", "drawn");
    if (reduce) { plan.classList.add("drawn"); return; }
    void plan.offsetWidth;
    plan.classList.add("go");
    setTimeout(function () { plan.classList.add("drawn"); }, 1700);
  }
  document.addEventListener("click", function (e) { if (e.target.closest(".plan-toggle")) runPlan(); });

  /* ---------- Price range estimator ----------
     PLACEHOLDER RANGES — replace with BrightScale's real numbers before launch,
     then set placeholder:false. Values are USD per square foot.            */
  var EST = {
    placeholder: true,
    bath:    { min: 30,  max: 150,  step: 5,  def: 60,  rate: { std: [250, 350], up: [350, 500], prem: [500, 750] } },
    kitchen: { min: 70,  max: 300,  step: 10, def: 150, rate: { std: [150, 250], up: [250, 400], prem: [400, 650] } },
    floor:   { min: 100, max: 2500, step: 50, def: 600, rate: { std: [6, 9],     up: [9, 14],    prem: [14, 22] } }
  };
  function money(n) {
    var r = n >= 10000 ? Math.round(n / 500) * 500 : Math.round(n / 50) * 50;
    return "$" + r.toLocaleString("en-US");
  }
  function setupEstimator() {
    var form = document.getElementById("est-form");
    if (!form) return;
    var size = form.querySelector("#est-size");
    var lastType = null;
    window.bsEstimate = function () {
      var type = form.querySelector("input[name=type]:checked").value;
      var finish = form.querySelector("input[name=finish]:checked").value;
      var cfg = EST[type];
      if (type !== lastType) {
        size.min = cfg.min; size.max = cfg.max; size.step = cfg.step; size.value = cfg.def;
        document.getElementById("size-min").textContent = cfg.min + " " + t("est.sqft");
        document.getElementById("size-max").textContent = cfg.max.toLocaleString("en-US") + " " + t("est.sqft");
        lastType = type;
      }
      var sq = Number(size.value);
      var r = cfg.rate[finish];
      document.getElementById("size-val").textContent = sq.toLocaleString("en-US") + " " + t("est.sqft") + " (≈ " + Math.round(sq * 0.0929) + " m²)";
      document.getElementById("est-range").textContent = money(sq * r[0]) + " – " + money(sq * r[1]);
      document.getElementById("est-meta").textContent = t("est.for") + " " + sq.toLocaleString("en-US") + " " + t("est.sqft");
      size.setAttribute("aria-valuetext", sq + " square feet");
      var note = document.getElementById("est-placeholder");
      if (note) note.hidden = !EST.placeholder;
      var link = document.getElementById("est-book");
      if (link) link.href = "contact.html?project=" + type + "&finish=" + finish + "&size=" + sq;
    };
    form.addEventListener("input", window.bsEstimate);
    form.addEventListener("change", window.bsEstimate);
  }

  /* ---------- Contact form: prefill from estimator ---------- */
  function setupContact() {
    var f = document.getElementById("visit-form");
    if (!f) return;
    var p = params.get("project");
    var sel = f.querySelector("select[name=project]");
    if (p && sel) {
      var map = { bath: "Bathroom remodel", kitchen: "Kitchen remodel", floor: "Flooring" };
      if (map[p]) sel.value = map[p];
      var desc = f.querySelector("textarea[name=details]");
      if (desc && params.get("size")) desc.value = "Price range tool: " + params.get("size") + " sq ft, " + (params.get("finish") || "") + " finish.\n";
    }
    var next = f.querySelector("input[name=_next]");
    if (next) next.value = new URL("thank-you.html", location.href).href;
  }

  /* ---------- Analytics only after consent ---------- */
  function loadTags() {
    if (window.__bsTags) return; window.__bsTags = true;
    var s = document.createElement("script");
    s.async = true; s.src = "https://www.googletagmanager.com/gtag/js?id=G-RZ9TNGMJRE";
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag("js", new Date());
    gtag("config", "G-RZ9TNGMJRE");
    gtag("config", "AW-17876699806");
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0"; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    fbq("init", "1439659704362687"); fbq("track", "PageView");
  }
  function setupCookies() {
    var c = document.getElementById("cookie");
    var choice = store("bs-consent");
    if (choice === "yes") { loadTags(); return; }
    if (choice === "no" || !c) return;
    c.classList.add("show");
    c.addEventListener("click", function (e) {
      if (e.target.closest(".ok")) { store("bs-consent", "yes"); loadTags(); c.classList.remove("show"); }
      if (e.target.closest(".no")) { store("bs-consent", "no"); c.classList.remove("show"); }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear();
    setupEstimator();
    applyLang(lang);
    setupContact();
    setupCookies();
    runPlan();
  });
})();

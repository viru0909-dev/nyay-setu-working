import {
    Scale, Gavel, ShieldCheck, ShoppingBag,
    Heart, Home, Monitor, Baby
} from 'lucide-react';

/**
 * Centralized FAQ data structure for NyaySetu.
 * Each category contains an id, display name, lucide-react icon component,
 * short description, and an array of question-answer pairs.
 */
const faqCategories = [
    {
        id: 'general-legal-rights',
        name: 'General Legal Rights',
        icon: Scale,
        description: 'Fundamental rights and legal awareness for every citizen',
        faqs: [
            {
                id: 'glr-1',
                question: 'What are Fundamental Rights under the Indian Constitution?',
                answer: 'Fundamental Rights are enshrined in Part III (Articles 12–35) of the Indian Constitution. They include the Right to Equality (Articles 14–18), Right to Freedom (Articles 19–22), Right against Exploitation (Articles 23–24), Right to Freedom of Religion (Articles 25–28), Cultural and Educational Rights (Articles 29–30), and the Right to Constitutional Remedies (Article 32). These rights are justiciable, meaning citizens can approach the Supreme Court or High Courts if these rights are violated.'
            },
            {
                id: 'glr-2',
                question: 'What is the Right to Information (RTI) and how can I use it?',
                answer: 'The Right to Information Act, 2005 empowers citizens to request information from public authorities. You can file an RTI application by writing to the Public Information Officer (PIO) of the concerned department, paying a nominal fee of ₹10. The PIO must respond within 30 days. If unsatisfied, you can appeal to the First Appellate Authority within 30 days, and further to the Central/State Information Commission. RTI can be filed online through the RTI Portal (rtionline.gov.in) for central government departments.'
            },
            {
                id: 'glr-3',
                question: 'What is Legal Aid and who is eligible for free legal services?',
                answer: 'Under the Legal Services Authorities Act, 1987, free legal aid is available to women, children, members of Scheduled Castes and Scheduled Tribes, victims of trafficking, persons with disabilities, persons in custody, industrial workmen, victims of mass disasters, and any person whose annual income is below ₹3 lakh (may vary by state). You can approach the nearest Legal Services Authority (District, State, or National) or Lok Adalat for assistance. The National Legal Services Authority (NALSA) coordinates this nationwide.'
            },
            {
                id: 'glr-4',
                question: 'What is the difference between a civil case and a criminal case?',
                answer: 'A civil case involves disputes between individuals or organizations regarding rights, obligations, or property (e.g., breach of contract, property disputes, family matters). The remedy is usually compensation or specific performance. A criminal case involves offences against the state or public order as defined in the Indian Penal Code (IPC) or other criminal statutes. The state prosecutes the accused, and the remedy includes imprisonment, fines, or both. Civil cases follow the Code of Civil Procedure (CPC), while criminal cases follow the Code of Criminal Procedure (CrPC).'
            },
            {
                id: 'glr-5',
                question: 'How can I file a Public Interest Litigation (PIL)?',
                answer: 'A PIL can be filed before the Supreme Court under Article 32 or before a High Court under Article 226 of the Constitution. Unlike regular cases, any public-spirited person can file a PIL even if they are not directly affected. The petition should be on judicial stamp paper, clearly state the public interest issue, include supporting evidence, and specify the relief sought. Court fees for PILs are minimal. However, frivolous PILs may attract penalties, so ensure the matter genuinely affects public interest.'
            }
        ]
    },
    {
        id: 'civil-law',
        name: 'Civil Law',
        icon: Gavel,
        description: 'Property disputes, contracts, and civil remedies',
        faqs: [
            {
                id: 'cl-1',
                question: 'What is the limitation period for filing a civil suit?',
                answer: 'The Limitation Act, 1963 prescribes time limits for filing civil suits. Key periods include: 3 years for suits based on contract, tort, or recovery of movable property; 12 years for suits related to possession of immovable property; 30 years for suits by the government. The limitation period generally starts from the date the cause of action arises. Courts can condone delay if sufficient cause is shown under Section 5, but this applies only to appeals and applications, not original suits.'
            },
            {
                id: 'cl-2',
                question: 'What is the process for filing a civil suit in India?',
                answer: 'To file a civil suit: (1) Draft a plaint (complaint) with facts, cause of action, and relief sought; (2) Determine the court with appropriate jurisdiction (territorial, pecuniary, and subject matter); (3) Pay the required court fees based on the suit valuation; (4) File the plaint along with supporting documents and a vakalatnama (if represented by a lawyer); (5) The court issues summons to the defendant; (6) The defendant files a written statement; (7) The case proceeds through framing of issues, evidence, arguments, and finally judgment.'
            },
            {
                id: 'cl-3',
                question: 'What is an injunction and when can I seek one?',
                answer: 'An injunction is a court order restraining a person from doing a specific act (prohibitory injunction) or directing them to perform a specific act (mandatory injunction). Temporary injunctions can be sought under Order 39 of CPC during the pendency of a suit. Permanent injunctions are granted as part of the final decree under Sections 36-42 of the Specific Relief Act, 1963. To obtain an injunction, you must demonstrate: (a) a prima facie case, (b) irreparable injury if the injunction is not granted, and (c) balance of convenience in your favour.'
            },
            {
                id: 'cl-4',
                question: 'What are Alternative Dispute Resolution (ADR) mechanisms?',
                answer: 'ADR mechanisms in India include: (1) Arbitration — governed by the Arbitration and Conciliation Act, 1996, where a neutral arbitrator resolves disputes; (2) Mediation — a mediator facilitates negotiations between parties; (3) Conciliation — similar to mediation but the conciliator may suggest solutions; (4) Lok Adalat — organized by Legal Services Authorities for amicable settlement, with decisions having the force of a civil court decree and no appeal. ADR is faster, less expensive, and less formal than court litigation. Many commercial contracts include mandatory arbitration clauses.'
            }
        ]
    },
    {
        id: 'criminal-law',
        name: 'Criminal Law',
        icon: ShieldCheck,
        description: 'Criminal offences, FIRs, bail, and criminal procedures',
        faqs: [
            {
                id: 'crl-1',
                question: 'How do I file a First Information Report (FIR)?',
                answer: 'An FIR is filed at the police station having jurisdiction over the area where the offence occurred. For cognizable offences (serious crimes like theft, assault, murder), the police are bound to register an FIR under Section 154 of CrPC — they cannot refuse. You can file it orally or in writing. The FIR should include: date, time, place of occurrence, details of the incident, names of suspects (if known), and names of witnesses. You are entitled to a free copy of the FIR. If the police refuse to register, you can approach the Superintendent of Police or file a complaint before the Magistrate under Section 156(3) CrPC.'
            },
            {
                id: 'crl-2',
                question: 'What are the rights of an arrested person?',
                answer: 'Under Indian law, an arrested person has several rights: (1) Right to know the grounds of arrest (Article 22(1)); (2) Right to consult and be defended by a legal practitioner (Article 22(1)); (3) Right to be produced before a Magistrate within 24 hours (Article 22(2)); (4) Right against self-incrimination (Article 20(3)); (5) Right to inform a friend, relative, or legal aid counsel about the arrest (Section 50A CrPC); (6) Right to free legal aid if unable to afford a lawyer (Section 304 CrPC); (7) Right to be medically examined; (8) Right not to be subjected to torture or inhuman treatment.'
            },
            {
                id: 'crl-3',
                question: 'What is the difference between bail and anticipatory bail?',
                answer: 'Regular Bail (Section 436/437 CrPC) is sought after arrest to secure release from custody. For bailable offences, bail is a matter of right; for non-bailable offences, it is at the court\'s discretion. Anticipatory Bail (Section 438 CrPC) is sought before arrest when a person apprehends arrest. It is filed before the Sessions Court or High Court. The court may impose conditions like surrendering passport, not leaving the country, cooperating with investigation, etc. Anticipatory bail protects against arrest but does not prevent investigation.'
            },
            {
                id: 'crl-4',
                question: 'What is a Zero FIR and when should it be filed?',
                answer: 'A Zero FIR is an FIR that can be filed at any police station regardless of jurisdiction. The Supreme Court mandated this to ensure that no time is wasted in registering an FIR, especially in serious cases. After registering the Zero FIR, the police station transfers it to the station having actual jurisdiction. This is particularly important in cases of sexual assault, where the Supreme Court in Lalita Kumari v. Government of UP (2014) held that police must register an FIR immediately for cognizable offences without any preliminary inquiry.'
            },
            {
                id: 'crl-5',
                question: 'What is the process for filing a private criminal complaint?',
                answer: 'If police refuse to act on your complaint, you can file a private criminal complaint before a Magistrate under Section 200 CrPC. The process involves: (1) Drafting a complaint with details of the offence; (2) Filing it before the appropriate Judicial Magistrate; (3) The Magistrate examines the complainant on oath (Section 200); (4) If a prima facie case is made out, the Magistrate may order investigation under Section 156(3) or take cognizance directly; (5) The Magistrate may also refer the case for inquiry under Section 202 before issuing process against the accused.'
            }
        ]
    },
    {
        id: 'consumer-protection',
        name: 'Consumer Protection',
        icon: ShoppingBag,
        description: 'Consumer rights, complaints, and grievance redressal',
        faqs: [
            {
                id: 'cp-1',
                question: 'How do I file a consumer complaint?',
                answer: 'Under the Consumer Protection Act, 2019, complaints can be filed with: (1) District Consumer Disputes Redressal Commission (claims up to ₹1 crore); (2) State Consumer Disputes Redressal Commission (claims ₹1 crore to ₹10 crore); (3) National Consumer Disputes Redressal Commission (claims above ₹10 crore). You can also file complaints online at edaakhil.nic.in. The complaint should include details of the transaction, deficiency in service or defect in goods, evidence (bills, receipts), and the relief sought. No lawyer is mandatory — you can argue your own case.'
            },
            {
                id: 'cp-2',
                question: 'What are unfair trade practices under consumer law?',
                answer: 'The Consumer Protection Act, 2019 defines unfair trade practices as any practice that uses deceptive methods to promote sales. This includes: false representation about the quality, standard, or grade of goods/services; misleading advertisements; bait-and-switch pricing; offering gifts or prizes with no intention of providing them; charging for goods/services not contracted for; not issuing receipts or bills; and manipulating product reviews. The Central Consumer Protection Authority (CCPA) can impose penalties up to ₹10 lakh on individuals and ₹50 lakh on entities for false advertisements.'
            },
            {
                id: 'cp-3',
                question: 'Can I return or get a refund for products purchased online?',
                answer: 'Yes, the Consumer Protection (E-Commerce) Rules, 2020 mandate that e-commerce platforms must clearly display their cancellation, return, refund, and exchange policies. Consumers have the right to return defective or misrepresented products. The platform must process refunds within a reasonable time. If the seller or platform refuses, you can file a complaint with the consumer forum. Screenshots of the product listing, order confirmation, delivery photos, and communication with the seller serve as important evidence.'
            },
            {
                id: 'cp-4',
                question: 'What protections exist against misleading advertisements?',
                answer: 'The Consumer Protection Act, 2019 introduced specific provisions against misleading ads. The CCPA can: (1) Issue cease-and-desist orders; (2) Impose penalties on manufacturers and endorsers; (3) Ban misleading advertisements. Endorsers (celebrities) can face penalties if they fail to verify product claims. First-time offenders among endorsers get a warning; repeat offenders face a ban of up to 1 year from endorsing any product and penalties up to ₹50 lakh. The Advertising Standards Council of India (ASCI) also handles complaints regarding misleading ads.'
            }
        ]
    },
    {
        id: 'family-law',
        name: 'Family Law',
        icon: Heart,
        description: 'Marriage, divorce, custody, maintenance, and succession',
        faqs: [
            {
                id: 'fl-1',
                question: 'What are the grounds for divorce in India?',
                answer: 'Grounds for divorce vary by personal law but common grounds under the Hindu Marriage Act, 1955 include: adultery, cruelty (physical or mental), desertion for a continuous period of 2 years, conversion to another religion, unsoundness of mind, leprosy, venereal disease, renunciation of the world, and if not heard alive for 7 years. Mutual consent divorce (Section 13B) requires both parties to agree and live separately for at least 1 year. Similar provisions exist under the Special Marriage Act, 1954. Muslim law allows divorce through talaq, khula, and mubarat.'
            },
            {
                id: 'fl-2',
                question: 'How is child custody determined in India?',
                answer: 'Child custody is determined based on the "welfare of the child" principle under the Guardians and Wards Act, 1890 and respective personal laws. Courts consider: the child\'s age (children under 5 are generally placed with the mother), physical and emotional needs, parent\'s financial capability, child\'s preference (if old enough), stability of environment, and the character of each parent. Types of custody include: physical custody (where the child lives), legal custody (decision-making authority), joint custody, and visitation rights. The non-custodial parent is typically granted visitation.'
            },
            {
                id: 'fl-3',
                question: 'What is the legal process for adoption in India?',
                answer: 'Adoption in India is governed by the Juvenile Justice (Care and Protection of Children) Act, 2015 for all religions and the Hindu Adoption and Maintenance Act, 1956 for Hindus. The process through CARA (Central Adoption Resource Authority) involves: (1) Register on CARA\'s portal (cara.nic.in); (2) Complete a Home Study Report; (3) Get matched with a child; (4) Acceptance of referral; (5) Pre-adoption foster care; (6) Court order for adoption. Prospective adoptive parents must be at least 25 years old, and single parents can also adopt. The process typically takes 2-3 years.'
            },
            {
                id: 'fl-4',
                question: 'What are the laws regarding maintenance and alimony?',
                answer: 'Maintenance can be claimed under multiple laws: (1) Section 125 CrPC — any wife, child, or parent unable to maintain themselves can claim maintenance from the spouse/child regardless of religion; (2) Hindu Adoption and Maintenance Act for Hindus; (3) Muslim Women (Protection of Rights on Divorce) Act, 1986. Alimony in divorce cases is determined by the court considering: income and assets of both parties, standard of living during marriage, duration of marriage, age and health, and the needs of children. Both interim (during proceedings) and permanent maintenance can be awarded.'
            }
        ]
    },
    {
        id: 'property-law',
        name: 'Property Law',
        icon: Home,
        description: 'Property registration, disputes, tenancy, and inheritance',
        faqs: [
            {
                id: 'pl-1',
                question: 'What is the process for property registration in India?',
                answer: 'Property registration is governed by the Registration Act, 1908 and the Indian Stamp Act, 1899. The process involves: (1) Draft a sale deed with all property details; (2) Pay stamp duty (varies by state, typically 5-7% of property value); (3) Pay registration charges (usually 1% of property value); (4) Both buyer and seller visit the Sub-Registrar\'s office with the deed, ID proofs, photographs, and two witnesses; (5) The Sub-Registrar verifies documents, collects biometrics, and registers the deed; (6) The registered deed is returned within a few days. Many states now offer online appointment booking and e-registration.'
            },
            {
                id: 'pl-2',
                question: 'What are the tenant rights under Indian rental laws?',
                answer: 'Tenants are protected under state-specific Rent Control Acts and the Model Tenancy Act, 2021. Key rights include: right to a written rental agreement; right against arbitrary eviction (landlord must follow due legal process); right to essential services (water, electricity); right to privacy (landlord cannot enter without notice); protection against unreasonable rent increases; right to receive rent receipts; and right to repairs if the landlord fails to maintain the property. The security deposit is typically capped at 2 months\' rent for residential and 6 months\' for commercial properties under the Model Tenancy Act.'
            },
            {
                id: 'pl-3',
                question: 'How can I resolve a property boundary dispute?',
                answer: 'Property boundary disputes can be resolved through: (1) Revenue records — obtain the village map (tippan/naksha) and mutation records from the tehsildar\'s office; (2) Survey — request a survey by the revenue department; (3) Mediation — try to reach an amicable settlement; (4) Civil suit — file a suit for declaration of title and possession in the appropriate civil court; (5) Revenue court — approach the Revenue Court/Board if it involves revenue records. Key documents include the sale deed, mutation entries, property tax receipts, survey reports, and satellite imagery/Google maps as supplementary evidence.'
            },
            {
                id: 'pl-4',
                question: 'What is RERA and how does it protect property buyers?',
                answer: 'The Real Estate (Regulation and Development) Act, 2016 (RERA) protects homebuyers by: (1) Requiring all projects above 500 sq.m. or 8 units to register with the state RERA authority; (2) Mandating developers to deposit 70% of project funds in an escrow account; (3) Requiring disclosure of project plans, approvals, and completion timelines; (4) Prohibiting sale on carpet area basis only (not super built-up); (5) Providing for compensation if possession is delayed; (6) Establishing RERA tribunals for dispute resolution. Complaints can be filed online on the respective state RERA website.'
            }
        ]
    },
    {
        id: 'cyber-crime',
        name: 'Cyber Crime',
        icon: Monitor,
        description: 'Online fraud, hacking, identity theft, and digital safety',
        faqs: [
            {
                id: 'cc-1',
                question: 'How do I report a cyber crime in India?',
                answer: 'Cyber crimes can be reported through: (1) National Cyber Crime Reporting Portal (cybercrime.gov.in) — file online complaints for all types of cyber crimes; (2) Helpline 1930 — for financial frauds (banks can freeze transactions quickly); (3) Local cyber crime police station — for FIR registration; (4) Local police station — if no dedicated cyber cell exists. When reporting, provide: screenshots of the fraud, transaction IDs, URLs, email headers, phone numbers used by fraudsters, and bank statements. For financial fraud, report within the "golden hour" (first few hours) for the best chance of recovering funds.'
            },
            {
                id: 'cc-2',
                question: 'What are the penalties for hacking and unauthorized access?',
                answer: 'Under the Information Technology Act, 2000: Section 43 provides for civil liability up to ₹5 crore for unauthorized access, data theft, or introducing viruses. Section 66 prescribes imprisonment up to 3 years and/or fine up to ₹5 lakh for computer-related offences. Section 66C (identity theft) carries up to 3 years imprisonment and ₹1 lakh fine. Section 66D (cheating by personation using computer resources) carries up to 3 years and ₹1 lakh fine. Section 66F (cyber terrorism) can lead to life imprisonment. These penalties are in addition to charges under the IPC.'
            },
            {
                id: 'cc-3',
                question: 'What should I do if I am a victim of online financial fraud?',
                answer: 'Immediately: (1) Call your bank to block the card/account and report the unauthorized transaction; (2) Call 1930 (National Cyber Crime Helpline) — they coordinate with banks to freeze fraudulent accounts; (3) File a complaint on cybercrime.gov.in; (4) File an FIR at the nearest police station. Under RBI guidelines, if you report unauthorized electronic transactions within 3 working days, your liability is limited to ₹10,000 for transactions up to ₹5 lakh. If reported within 4-7 days, liability is limited to the transaction value or ₹25,000, whichever is lower.'
            },
            {
                id: 'cc-4',
                question: 'Is sharing someone\'s private photos/videos online a crime?',
                answer: 'Yes, it is a serious offence under multiple laws: Section 66E of the IT Act (violation of privacy by capturing/publishing private images) — up to 3 years imprisonment and ₹2 lakh fine. Section 67/67A of the IT Act (publishing obscene/sexually explicit material) — up to 5-7 years imprisonment and ₹10 lakh fine. Under IPC Section 354C (voyeurism) — up to 3-7 years imprisonment. For revenge porn specifically, victims can also seek relief under the POCSO Act (if minor), and civil remedies including injunctions and damages. Platforms are required to remove such content upon receiving a complaint.'
            }
        ]
    },
    {
        id: 'women-child-protection',
        name: 'Women & Child Protection',
        icon: Baby,
        description: 'Laws protecting women and children from abuse and exploitation',
        faqs: [
            {
                id: 'wcp-1',
                question: 'What protections exist under the Domestic Violence Act?',
                answer: 'The Protection of Women from Domestic Violence Act, 2005 provides comprehensive protection including: (1) Protection Orders — restraining the abuser from committing violence; (2) Residence Orders — preventing dispossession from the shared household; (3) Monetary Relief — for medical expenses, loss of earnings, and damages; (4) Custody Orders — temporary custody of children; (5) Compensation Orders — for injuries and emotional distress. Complaints can be filed with the Protection Officer, police station, or Magistrate. A woman can also seek shelter in a government-run shelter home. The Act covers physical, sexual, verbal, emotional, and economic abuse.'
            },
            {
                id: 'wcp-2',
                question: 'What are the key provisions of the POCSO Act for child protection?',
                answer: 'The Protection of Children from Sexual Offences Act, 2012 (POCSO) provides: (1) Gender-neutral protection for children under 18; (2) Defines various forms of sexual abuse including penetrative assault, sexual assault, harassment, and pornography; (3) Aggravated penalties when the offender is in a position of trust (teacher, relative, police officer); (4) Mandatory reporting — failure to report is an offence; (5) Child-friendly investigation and trial procedures (no confrontation with accused, recording of statements); (6) Special Courts for speedy trial; (7) Presumption of guilt — the burden of proof lies on the accused. Penalties range from 3 years to life imprisonment.'
            },
            {
                id: 'wcp-3',
                question: 'How can I report workplace sexual harassment?',
                answer: 'Under the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013: (1) File a written complaint with the Internal Complaints Committee (ICC) of your organization within 3 months of the incident (extendable by 3 months); (2) If no ICC exists or the complaint is against the employer, approach the Local Complaints Committee (LCC) formed by the District Officer; (3) Every organization with 10+ employees must constitute an ICC; (4) The complaint can be filed by the aggrieved woman or any person authorized by her; (5) The ICC must complete the inquiry within 90 days. The Act covers physical contact, sexual advances, demand for sexual favours, sexually coloured remarks, and showing pornography.'
            },
            {
                id: 'wcp-4',
                question: 'What legal remedies are available for dowry harassment?',
                answer: 'Multiple legal provisions address dowry harassment: (1) Dowry Prohibition Act, 1961 — giving or receiving dowry is punishable with minimum 5 years imprisonment and ₹15,000 fine (or the dowry amount, whichever is more); (2) Section 498A IPC — cruelty by husband or relatives, punishable up to 3 years imprisonment; (3) Section 304B IPC — dowry death (death within 7 years of marriage under suspicious circumstances), carries minimum 7 years to life imprisonment; (4) Section 113B of Evidence Act — creates a presumption of dowry death. Victims can approach the police, Women\'s Commission, or file a complaint before the Magistrate.'
            },
            {
                id: 'wcp-5',
                question: 'What are the helpline numbers for women and children in distress?',
                answer: 'Key helplines include: (1) Women Helpline — 181 (24/7, all states); (2) National Commission for Women — 7827-170-170; (3) Child Helpline (Childline) — 1098 (24/7); (4) Police Emergency — 112; (5) Cyber Crime — 1930; (6) Senior Citizens — 14567; (7) National Human Rights Commission — 14433. The 181 helpline provides assistance with domestic violence, sexual harassment, dowry harassment, and connects women with nearby police, hospitals, and legal aid. One Stop Centres (Sakhi Centres) in every district provide integrated support including medical, legal, psychological counselling, and temporary shelter.'
            }
        ]
    }
];

export default faqCategories;

"""
RTM Knowledge Base - Chapter builders (Part 1: chapters 1-10).

Each builder receives a `helpers` dict with style objects and helper functions
and returns a list of ReportLab Flowables.
"""


def ch1_foreword(h):
    """Chapter 1 — Foreword & How To Read This Document."""
    out = []
    P, S, SP, B, CL = h['Paragraph'], h['Spacer'], h['Spacer'], h['BODY'], h['callout']
    H2, H3, H4 = h['H2'], h['H3'], h['H4']
    bullet_list, numbered_list = h['bullet_list'], h['numbered_list']

    out.append(P(
        '<i>This document exists for one reason: to make sure that when the '
        'trading engine is finally designed, it is designed by someone who '
        'already thinks like a professional RTM trader.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>1.1  Why this phase exists</b>', H2))
    out.append(P(
        'Every failing RTM implementation shares the same root cause: the '
        'engineer skipped the reasoning phase and jumped straight into pattern '
        'detection. They built a system that recognises what a supply zone '
        'looks like, but never understood <i>why</i> a supply zone forms, '
        '<i>why</i> it sometimes fails, and <i>why</i> a professional trader '
        'would walk away from a perfectly drawn zone because the curve is '
        'misaligned. The result is a system that marks every base on the '
        'chart and trades them all with the same probability weight, which is '
        'mathematically indistinguishable from random entries.', B))
    out.append(P(
        'Phase Zero exists to prevent that failure mode. Before any code is '
        'written, the engine\'s author must internalise the reasoning chain a '
        'professional follows when they look at a chart. They must understand '
        'that an engulf is not a candle pattern — it is the visible footprint '
        'of institutional commitment after a liquidity event. They must '
        'understand that freshness is not a binary flag but a probability '
        'multiplier that decays with every touch. They must understand that '
        'the curve is the gravitational field inside which every lower-'
        'timeframe pattern either succeeds or fails.', B))
    out.append(P(
        'This document is not a tutorial. It is a knowledge base. The '
        'distinction matters: a tutorial teaches you to draw a zone; a '
        'knowledge base teaches you to <i>reason</i> about whether the zone '
        'deserves to be drawn at all. Every entry, every relationship, every '
        'failure mode in this volume is engineered to feed the future AI '
        'engine\'s reasoning module — not its pattern matcher.', B))

    out.append(P('<b>1.2  Document structure</b>', H2))
    out.append(P(
        'The volume is organised into five conceptual parts. <b>Part I '
        '(Chapters 2–4)</b> establishes first principles, the concept entry '
        'schema, and the master glossary. <b>Part II (Chapters 5–8)</b> is '
        'the core concept catalogue, covering market structure, zones, '
        'patterns, and advanced patterns — each entry written in the same '
        'ten-field schema. <b>Part III (Chapters 9–10)</b> covers liquidity '
        'and multi-timeframe context, the two forces that decide whether a '
        'pattern on a lower timeframe is meaningful. <b>Part IV (Chapters '
        '11–13)</b> builds the knowledge graph, the failure catalog, and the '
        'chart-study framework. <b>Part V (Chapters 14–18)</b> is the '
        'reasoning dataset, the probability matrix, the anti-pattern catalog, '
        'and the bridge to the future engine.', B))

    out.append(P('<b>1.3  How each concept entry is structured</b>', H2))
    out.append(P(
        'Every concept in Chapters 5–10 is written in a fixed ten-field '
        'schema. The schema is the same one the future AI engine will '
        'consume, so the document doubles as the engine\'s training '
        'specification:', B))
    out.extend(numbered_list([
        '<b>Definition</b> — a one-paragraph definition grounded in auction logic, never in geometry.',
        '<b>Purpose</b> — what decision this concept enables for the trader.',
        '<b>Context</b> — where on the chart and in what sequence this concept appears.',
        '<b>Why it forms</b> — the institutional mechanism that produces the visible structure.',
        '<b>How professionals identify it</b> — the operational identification rules, not the textbook ones.',
        '<b>Common mistakes</b> — the failure modes new traders fall into when identifying it.',
        '<b>Failure conditions</b> — when this concept ceases to be valid, even if drawn correctly.',
        '<b>Relationship to other RTM concepts</b> — the edges in the knowledge graph.',
        '<b>Probability contribution</b> — how much this concept lifts the base rate when present.',
        '<b>Real chart example</b> — a schematic example described in words, since the principle matters more than the symbol.',
    ]))
    out.append(S(1, 6))
    out.append(P(
        'A concept that cannot fill all ten fields is not yet understood. '
        'The future engine should reject any pattern detection that lacks a '
        'complete entry — partial understanding produces partial signals, '
        'and partial signals are how accounts bleed to death.', B))

    out.append(P('<b>1.4  The reasoning dataset convention</b>', H2))
    out.append(P(
        'Chapters 14 and 15 contain the reasoning dataset. Every entry '
        'answers <i>why</i>, never just <i>what</i>. The convention is '
        'rigid: each reasoning chain must explain the cause of every visible '
        'event on the chart — why price left, why price stopped, why '
        'liquidity formed there and not elsewhere, why compression appeared, '
        'why the zone failed, why the engulf succeeded, why the structure is '
        'fresh, why it is nested. A reasoning chain that describes what '
        'happened without explaining why is treated as a defective chain and '
        'rejected. This is the standard the future engine must hold itself '
        'to.', B))

    out.append(P('<b>1.5  What is deliberately excluded</b>', H2))
    out.append(P(
        'This document contains no indicators. No moving averages, no RSI, '
        'no MACD, no Bollinger Bands, no Fibonacci retracements, no volume '
        'profiles, no order-flow heatmaps. RTM is a self-contained '
        'methodology: it derives every signal from price structure and the '
        'liquidity footprint that structure implies. Hybrid systems — RTM '
        'plus an oscillator, RTM plus a moving average — are not '
        'improvements; they are compromises that destroy the very thing '
        'that makes RTM work, which is the discipline of refusing to act on '
        'any signal whose cause cannot be explained. The future engine must '
        'inherit this exclusion. Adding a single indicator is the first step '
        'in the slow death of any RTM system.', B))

    out.append(P('<b>1.6  Glossary and knowledge graph usage</b>', H2))
    out.append(P(
        'Chapter 4 is a compact glossary intended for fast lookup. Chapters '
        '5–10 are the deep concept entries. Chapter 11 is the knowledge '
        'graph — the formal statement of how every concept links to every '
        'other concept. The graph is the single most important artefact in '
        'this volume: the future engine\'s reasoning module will traverse '
        'this graph to generate its WHY chains. A concept that is not '
        'connected to the graph is a concept the engine cannot reason about, '
        'and therefore a concept the engine must not trade.', B))
    out.append(S(1, 6))
    out.append(CL(
        'Reader contract',
        ['Read Chapter 2 before any concept entry. Read Chapter 3 before '
         'evaluating any entry. Read Chapter 11 before reading any failure '
         'mode. The order is not a suggestion; it is the order in which the '
         'reasoning chain itself is constructed.']))
    return out


def ch2_first_principles(h):
    """Chapter 2 — The RTM First Principles."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    bullet_list = h['bullet_list']

    out.append(P(
        '<i>RTM is not a strategy. It is a model of how price is delivered. '
        'Strategies are derived from the model — never the other way around.</i>',
        h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>2.1  Auction Market Theory as the root</b>', H2))
    out.append(P(
        'RTM descends from Auction Market Theory. The market is treated as a '
        'continuous double auction: every tick is a transaction between a '
        'buyer and a seller, every transaction clears at a price both sides '
        'agreed to, and the sequence of cleared prices is the chart. Price '
        'moves because the auction is imbalanced — more aggressive buyers '
        'than sellers push price up, more aggressive sellers than buyers '
        'push price down. Price stops because the auction reaches balance — '
        'the aggressors on one side are exhausted or absorbed, and the '
        'opposing side re-enters at that level.', B))
    out.append(P(
        'The implication is structural: every move has a reason, and every '
        'stop has a reason. The reason is not always visible to the retail '
        'eye, but it is always present in the auction footprint. RTM is the '
        'discipline of reading that footprint and inferring the underlying '
        'mechanism — the institutional intent that produced it.', B))

    out.append(P('<b>2.2  Why the institutional footprint is visible</b>', H2))
    out.append(P(
        'Institutions cannot hide. A retail trader can move 100 shares '
        'without affecting the market; an institution trying to fill a '
        'multi-million-share position cannot. To accumulate a large long '
        'position without sending price against itself, an institution must '
        'distribute its buying across time and across price levels. It '
        'accumulates during selling pressure (when retail is panicking out '
        'of longs), it pauses to let price recover (forming a base), and it '
        'resumes accumulation when the next wave of selling arrives. The '
        'result is the visible structure RTM traders read: the base, the '
        'departure, the failure to return.', B))
    out.append(P(
        'The same logic applies to distribution. To unload a large long '
        'position without crashing price, an institution distributes into '
        'buying pressure (when retail is chasing the breakout), pauses to '
        'let price consolidate, and resumes distribution at the next wave '
        'of buying. The chart shows the same anatomy in reverse: an upthrust '
        'into a supply zone, a base, a downward departure, a failure to '
        'return. The institution is not trying to leave footprints — it has '
        'no choice. The footprint is the price.', B))

    out.append(P('<b>2.3  The IPDA premise</b>', H2))
    out.append(P(
        'RTM traders often refer to the <i>Interbank Price Delivery '
        'Algorithm</i> (IPDA) — a shorthand for the collective algorithmic '
        'execution layer of the largest market participants. The premise is '
        'that price delivery is not random: it follows a repeatable logic '
        'in which price moves from one liquidity pool to the next, sweeping '
        'stops and filling pending orders along the way, and reacts to '
        'unfilled institutional order blocks (supply and demand zones) '
        'because those blocks contain real orders that have not yet been '
        'matched.', B))
    out.append(P(
        'Whether one treats the IPDA as a literal algorithm or as a '
        'personification of institutional behaviour is irrelevant to RTM '
        'practice. The observable fact is that price behaves as if it is '
        'being delivered by a process that seeks liquidity and respects '
        'unfilled inventory. RTM trades the observable process, not the '
        'metaphysical claim.', B))

    out.append(P('<b>2.4  Why RTM rejects indicators</b>', H2))
    out.append(P(
        'Indicators are derivatives of price. A moving average is price '
        'smoothed; an oscillator is price momentum normalised; a band is '
        'price volatility bounded. None of them contain information that is '
        'not already in the price series. Worse, they lag: by definition '
        'they describe what price has already done, never what price is '
        'about to do. An RTM trader reasons from the cause (the institutional '
        'intent visible in the structure) to the effect (the next likely '
        'move). An indicator trader reasons from the effect (the lagging '
        'derivative) to the effect — a circular argument that contains no '
        'predictive content.', B))
    out.append(P(
        'There is a deeper reason RTM rejects indicators: indicators '
        'discourage reasoning. Once a trader sees an oversold RSI, they '
        'stop asking why price reached that level and start asking whether '
        'the RSI will reverse. The WHY chain is broken. RTM exists to '
        'preserve the WHY chain, and any tool that breaks it is incompatible '
        'with the methodology — regardless of how profitable it might '
        'appear in isolation.', B))

    out.append(P('<b>2.5  The three RTM axioms</b>', H2))
    out.append(P(
        'RTM rests on three axioms. They are not derived from anything else; '
        'they are the premises from which every concept in the methodology '
        'is derived:', B))
    out.append(S(1, 6))
    out.append(CL('The Three Axioms of RTM', [
        '<b>Axiom 1 — Every move has a reason.</b> Price does not move '
        'randomly. Every impulse, every extension, every gap is the visible '
        'result of an institutional decision. If you cannot identify the '
        'reason, you have not finished reading the chart — you have only '
        'finished looking at it.',
        '<b>Axiom 2 — Every stop has a reason.</b> Price does not stop '
        'randomly. Every pause, every base, every reversal occurs at a '
        'level where institutional inventory rests. The level exists '
        'because orders were left there; the stop occurs because those '
        'orders are being filled.',
        '<b>Axiom 3 — Every failure has a reason.</b> A structure that '
        'fails did not fail by accident. It failed because the institutional '
        'intent that produced it changed — the curve shifted, the liquidity '
        'was already swept, the opposing side re-accumulated. The reason is '
        'always on a higher timeframe than the failure itself.',
    ]))
    out.append(S(1, 6))
    out.append(P(
        'Every concept in this volume is a consequence of these three '
        'axioms. The future engine\'s reasoning module must check all three '
        'before issuing any signal: <i>what is the reason for the move? what '
        'is the reason for the stop? what would be the reason for a '
        'failure?</i> If any of the three cannot be answered, the signal '
        'must not be issued.', B))

    out.append(P('<b>2.6  Edge: where the IPDA must react vs may react</b>', H2))
    out.append(P(
        'The professional RTM trader distinguishes between two kinds of '
        'reaction points. A <b>must-react</b> level is one where the IPDA '
        'has no choice but to interact with the level — typically because '
        'the level contains unfilled institutional inventory that cannot be '
        'bypassed without leaving footprints (a fresh, high-quality zone '
        'aligned with the curve on multiple timeframes). A <b>may-react</b> '
        'level is one where reaction is possible but not enforced — a '
        'consumed zone, a stale flag limit, a structure that lacks '
        'multi-timeframe confluence.', B))
    out.append(P(
        'The professional\'s entire edge comes from concentrating capital '
        'in must-react situations and ignoring may-react situations. The '
        'amateur concentrates capital in may-react situations because they '
        'look superficially similar — and loses money proportionally. The '
        'future engine must encode this distinction explicitly: every '
        'candidate trade must be classified as must-react or may-react, and '
        'may-react trades must be filtered out by default. The default is '
        'no trade; the engine needs positive evidence to override the '
        'default.', B))

    out.append(P('<b>2.7  The reasoning discipline</b>', H2))
    out.append(P(
        'The unifying discipline of RTM is the refusal to act without a '
        'cause. Every entry is the conclusion of a WHY chain. Every '
        'invalidation is the conclusion of another WHY chain. The trader '
        'who cannot produce the chain is not trading — they are gambling '
        'with extra steps. The chapters that follow are an attempt to make '
        'the chain explicit, enumerable, and ultimately computable.', B))
    return out


def ch3_schema(h):
    """Chapter 3 — The Concept Entry Schema."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    numbered_list, mono_block = h['numbered_list'], h['mono_block']

    out.append(P(
        '<i>The schema is the contract between the human expert and the '
        'future engine. A concept that cannot be expressed in the schema '
        'cannot be traded by the engine.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>3.1  Why a schema is necessary</b>', H2))
    out.append(P(
        'A free-form concept description is fine for human reading but '
        'useless for a future engine. The engine needs every concept '
        'expressed in the same ten fields, with the same semantics, so that '
        'its reasoning module can compare concepts, compose them, and '
        'detect contradictions. The schema is therefore not a stylistic '
        'choice — it is the engine\'s data model. Every concept in '
        'Chapters 5–10 conforms to it, and every concept the future engine '
        'adds to its knowledge base must conform to it as well.', B))

    out.append(P('<b>3.2  The ten fields</b>', H2))
    out.append(P(
        'Each field answers a single question. Together, the ten questions '
        'constitute a complete reasoning audit:', B))
    out.extend(numbered_list([
        '<b>Definition.</b> A one-paragraph definition grounded in auction logic. The definition must explain what the concept <i>is</i> in terms of institutional behaviour, not what it <i>looks like</i> on the chart. A geometric definition ("a zone between two candles") is rejected; a causal definition ("a price band containing unfilled institutional orders") is accepted.',
        '<b>Purpose.</b> The decision the trader makes when the concept is present. A concept with no decision attached is decoration. If the purpose field is empty, the concept should not be in the knowledge base.',
        '<b>Context.</b> Where the concept appears on the chart and in what sequence. Context includes timeframe, position in the structure (impulse vs correction), and what must have happened immediately before for the concept to be valid.',
        '<b>Why it forms.</b> The institutional mechanism that produces the visible structure. This field is the heart of the schema — it is the difference between a trader who memorises patterns and a trader who reasons about cause.',
        '<b>How professionals identify it.</b> The operational identification rules. Not the textbook rules — the rules a professional actually uses, including the implicit checks (curve alignment, freshness, departure strength) that separate a real instance from a lookalike.',
        '<b>Common mistakes.</b> The failure modes new traders fall into. Documenting mistakes is how the schema prevents the engine from reproducing them.',
        '<b>Failure conditions.</b> When the concept ceases to be valid even if drawn correctly. A zone is fresh until it is touched; a flag limit holds until the higher timeframe shifts. Failure conditions are the engine\'s invalidation logic.',
        '<b>Relationship to other RTM concepts.</b> The edges in the knowledge graph. This field is what enables the engine to traverse from one concept to another during reasoning.',
        '<b>Probability contribution.</b> How much the concept lifts the base rate when present. Numbers are practitioner estimates, not statistical claims — but they encode relative importance, which the engine needs for prioritisation.',
        '<b>Real chart example.</b> A schematic example described in words. The principle matters more than the symbol; the example must illustrate the <i>cause</i>, not the candle shape.',
    ]))

    out.append(P('<b>3.3  Worked example — the Base</b>', H2))
    out.append(P(
        'To illustrate the schema, here is a complete entry for the most '
        'foundational concept in RTM: the <b>Base</b>.', B))
    out.append(S(1, 4))
    out.append(mono_block([
        'CONCEPT: Base',
        '',
        'DEFINITION:',
        '  A base is a compact consolidation of price — typically 1 to 6 candles,',
        '  often with overlapping ranges — that forms immediately before a strong',
        '  directional departure. It is the visible footprint of institutional',
        '  accumulation or distribution: the institution pauses its execution to',
        '  let price settle, then resumes aggressiveness in the same direction.',
        '',
        'PURPOSE:',
        '  The base is the entry trigger. A zone without a preceding base is a',
        '  level of interest, not a tradeable zone. The base certifies that the',
        '  institution was present at that level.',
        '',
        'CONTEXT:',
        '  Forms at the origin of an impulsive move, never mid-trend. Appears on',
        '  the timeframe being traded and (ideally) on at least one higher',
        '  timeframe whose zone it nests inside. The base precedes the departure',
        '  candle, not the other way around.',
        '',
        'WHY IT FORMS:',
        '  An institution building a position cannot fill it all at once without',
        '  moving price against itself. It must accumulate over time. During',
        '  accumulation, price compresses as the institution absorbs incoming',
        '  opposing flow. Once accumulation is complete, the institution becomes',
        '  the dominant aggressor and price departs sharply. The base is the',
        '  compression; the departure is the aggression.',
        '',
        'HOW PROFESSIONALS IDENTIFY IT:',
        '  (1) Compact range — the base candles overlap heavily, showing no',
        '      directional commitment.',
        '  (2) Located at the origin of an impulse — not at the end of one.',
        '  (3) Followed by a strong departure candle (engulf or momentum candle)',
        '      that exceeds the base range decisively.',
        '  (4) The departure must break structure on at least its own timeframe.',
        '  (5) The base\'s extremum (proximal line) is the level to defend.',
        '',
        'COMMON MISTAKES:',
        '  - Marking any consolidation as a base, regardless of departure strength.',
        '  - Marking a base at the END of a move (a topping structure) as a base',
        '    at the origin of the next move — they are different things.',
        '  - Treating a base that lacks a clear departure as tradeable. A base',
        '    without departure is just noise.',
        '  - Drawing the zone too tight or too loose — the proximal line is the',
        '    base extremum; the distal line is the opposite end of the base.',
        '',
        'FAILURE CONDITIONS:',
        '  - The departure fails to break structure (no BOS) — the base is',
        '    unconfirmed.',
        '  - Price returns to the base and breaks the proximal line decisively —',
        '    the institutional inventory has been invalidated; the zone is consumed.',
        '  - A higher-timeframe shift in curve occurs between base formation and',
        '    the return — the base\'s intent is no longer aligned with the dominant',
        '    institutional direction.',
        '',
        'RELATIONSHIP TO OTHER CONCEPTS:',
        '  - is-a-part-of: Supply, Demand (every zone has a base at its origin)',
        '  - precedes: Engulf, FTR (the departure creates both)',
        '  - amplifies-probability-of: any pattern that returns to the base',
        '  - is-confirmed-by: BOS (the departure must break structure)',
        '  - is-invalidated-by: Curve shift on the parent timeframe',
        '',
        'PROBABILITY CONTRIBUTION:',
        '  Base alone, no other context: ~50% (coin flip — a base is necessary',
        '    but not sufficient).',
        '  Base + curve alignment: ~62%.',
        '  Base + curve + fresh (no touch yet): ~70%.',
        '  Base + curve + fresh + FTR confirmation: ~78%.',
        '',
        'REAL CHART EXAMPLE:',
        '  On an H1 chart of EURUSD, price sells off into a 4-candle base at',
        '  1.0820-1.0835, then explodes upward with a strong engulf that breaks',
        '  the prior swing high at 1.0855. The base is marked 1.0820-1.0835.',
        '  When price later retraces to 1.0828, the base holds and bounces.',
        '  WHY: the institution accumulated between 1.0820 and 1.0835, defended',
        '  that inventory on the return, and resumed the up-move.',
    ]))
    out.append(P(
        'Every concept entry in Chapters 5–10 follows this exact structure. '
        'The future engine\'s knowledge base should be a JSON serialisation '
        'of these entries, with each field as a structured attribute. A '
        'concept that does not fit the schema is a concept the engine must '
        'not trade.', B))
    return out


def ch4_glossary(h):
    """Chapter 4 — RTM Glossary."""
    out = []
    P, S, B = h['Paragraph'], h['Spacer'], h['BODY']
    H2 = h['H2']
    std_table, TBL_HEADER, TBL_CELL, TBL_CELL_BOLD = (
        h['std_table'], h['TBL_HEADER'], h['TBL_CELL'], h['TBL_CELL_BOLD'])

    out.append(P(
        '<i>The glossary is the fast-lookup index. Deep entries live in '
        'Chapters 5–10; this chapter is the bookmark.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P(
        'The glossary groups every RTM term used in this volume into six '
        'clusters: Structure, Zones, Patterns, Liquidity, Quality, and '
        'Multi-Timeframe. Each entry is a single-line definition intended '
        'for fast recall, not for first-time learning. If a term is '
        'unfamiliar, find its full entry in the chapter cross-referenced '
        'in the third column.', B))

    entries = [
        # (Term, Cluster, Definition)
        ('Market Structure', 'Structure', 'The sequence of swings that defines the directional bias of a chart; the skeleton on which every other concept hangs.'),
        ('Swing', 'Structure', 'A pivot point on the chart where price reversed direction; the atomic unit of structure.'),
        ('Impulse', 'Structure', 'A directional move that breaks the prior swing; the visible footprint of institutional aggression.'),
        ('Correction', 'Structure', 'A counter-trend move that does not break the prior swing; the visible footprint of opposing absorption.'),
        ('Momentum', 'Structure', 'The strength of an impulse, measured by range, body proportion, and time taken.'),
        ('Strength', 'Structure', 'A property of a move indicating institutional commitment — large bodies, minimal wicks, decisive structure breaks.'),
        ('Weakness', 'Structure', 'A property of a move indicating lack of commitment — small bodies, large wicks, overlapping ranges, shallow structure breaks.'),
        ('BOS', 'Structure', 'Break of Structure — price closes beyond the prior swing high (bullish) or low (bearish), confirming trend continuation.'),
        ('CHoCH', 'Structure', 'Change of Character — price breaks the most recent counter-trend swing, signalling potential reversal of intent.'),
        ('Curve', 'Structure', 'The directional bias inherited from the highest relevant timeframe; the gravitational field inside which lower-timeframe patterns operate.'),
        ('Supply', 'Zones', 'A price band containing unfilled institutional sell orders; price tends to react down on contact.'),
        ('Demand', 'Zones', 'A price band containing unfilled institutional buy orders; price tends to react up on contact.'),
        ('Base', 'Zones', 'A compact consolidation at the origin of an impulse; the institutional accumulation/distribution footprint.'),
        ('Fresh Zone', 'Zones', 'A zone that has not yet been touched by a return move; contains the full unfilled institutional inventory.'),
        ('Consumed Zone', 'Zones', 'A zone that has been touched, partially filled, and therefore has reduced reaction probability.'),
        ('Decision Point', 'Zones', 'A price level where multiple structures converge — a zone, a swing, a flag limit — forcing the IPDA to make a decision.'),
        ('Zone Quality', 'Quality', 'A composite score of freshness, departure strength, curve alignment, and positional strength used to rank zones.'),
        ('Nested Zones', 'Zones', 'Two or more zones of different timeframes that overlap in price; multi-timeframe confluence.'),
        ('Arrival', 'Zones', 'The manner in which price approaches a zone — impulsive arrival is institutional, choppy arrival is retail-driven.'),
        ('Departure', 'Zones', 'The manner in which price leaves a zone — strong departures confirm institutional commitment.'),
        ('Reaction', 'Zones', 'The price behaviour on contact with a zone — a clean rejection is high-probability; a slow grind through is low-probability.'),
        ('Compression', 'Patterns', 'A tight consolidation of overlapping candles; institutional accumulation before a directional resolve.'),
        ('Engulf', 'Patterns', 'A candle whose body fully covers the prior candle\'s body in the opposite direction; the footprint of institutional commitment post-event.'),
        ('FTR', 'Patterns', 'Failure To Return — after a departure, price fails to return to the origin, indicating no opposing interest and confirming the move\'s intent.'),
        ('Flag', 'Patterns', 'A short counter-trend consolidation after an impulse; a continuation pattern, not a reversal.'),
        ('Flag Limit (FL)', 'Patterns', 'The boundary of a flag beyond which the prior impulse\'s intent is invalidated; a high-probability reaction level.'),
        ('Continuation Pattern', 'Patterns', 'A structure that pauses the trend before resuming it — flags, compressions, shallow pullbacks.'),
        ('Reversal Pattern', 'Patterns', 'A structure that ends the trend — QM, Diamond, deep CHoCH after liquidity sweep.'),
        ('Decision Candle', 'Patterns', 'The candle at a zone whose close direction confirms or denies the zone\'s reaction; the entry trigger candle.'),
        ('Quasimodo (QM)', 'Patterns', 'A reversal structure: left shoulder, lower high (or higher low for inverse), head, BOS, return to shoulder, entry. Indicates liquidity sweep + intent shift.'),
        ('Diamond', 'Patterns', 'A symmetric reversal structure: an impulse, a shallow counter-move (the diamond), then a continuation in the impulse direction. Often forms at trend exhaustion.'),
        ('MPL', 'Patterns', 'Maximum Pain Line / Most Probable Line — the level where the most resting orders sit, often a prior swing high/low that has not yet been swept.'),
        ('BSZ', 'Patterns', 'Base & Solid Zone / Buy-Side Zone — a zone that has been confirmed by multiple touches and is treated as a high-quality reference.'),
        ('Liquidity', 'Liquidity', 'Resting orders (stops and pending entries) clustered at predictable price levels; the fuel the IPDA seeks.'),
        ('Liquidity Pool', 'Liquidity', 'A concentration of resting orders, typically beyond an obvious swing high or low.'),
        ('Stop Hunt', 'Liquidity', 'A deliberate move beyond a swing to trigger stops, then reversal; the IPDA\'s most common manipulation.'),
        ('IPDA Manipulation', 'Liquidity', 'The pattern by which price engineers liquidity grabs before delivering the true directional move.'),
        ('Buy-Side Liquidity', 'Liquidity', 'Resting buy stops above swing highs; the IPDA often sweeps these before bearish moves.'),
        ('Sell-Side Liquidity', 'Liquidity', 'Resting sell stops below swing lows; the IPDA often sweeps these before bullish moves.'),
        ('Sweep', 'Liquidity', 'A quick move beyond a liquidity pool that immediately reverses; the visible signature of a stop hunt.'),
        ('Multi-Timeframe Context', 'MTF', 'The discipline of reading the highest relevant timeframe first and descending; structure on the HTF constrains the LTF.'),
        ('Top-Down Analysis', 'MTF', 'The sequence: Monthly → Weekly → Daily → H4 → H1 → M15, used to identify the curve, the HTF zones, and the LTF entry trigger.'),
        ('Timeframe Hierarchy', 'MTF', 'The rule that a structure on a higher timeframe dominates a conflicting structure on a lower timeframe.'),
        ('HTF Bias', 'MTF', 'The directional intent inherited from the higher timeframe; the LTF trader trades only in alignment with it.'),
        ('LTF Execution', 'MTF', 'Using the lower timeframe to time entries inside HTF zones — the LTF provides precision, the HTF provides direction.'),
    ]

    data = [[
        P('Term', h['TBL_HEADER']),
        P('Cluster', h['TBL_HEADER']),
        P('One-line definition', h['TBL_HEADER']),
    ]]
    for term, cluster, defn in entries:
        data.append([
            P(term, TBL_CELL_BOLD),
            P(cluster, TBL_CELL),
            P(defn, TBL_CELL),
        ])

    out.extend(std_table(
        data,
        col_ratios=[0.22, 0.13, 0.65],
        caption_text='Table 4.1 — RTM Glossary. Cross-reference the cluster column to the relevant deep-entry chapter (Structure→Ch5, Zones→Ch6, Patterns→Ch7, Liquidity→Ch9, MTF→Ch10).'
    ))

    out.append(P(
        'A note on terminology: RTM is a community-developed methodology, '
        'and several terms (notably MPL and BSZ) have multiple community '
        'usages. Where this volume uses a specific meaning, the glossary '
        'lists that meaning; the deep entry in the relevant chapter '
        'clarifies the alternatives. The future engine should adopt the '
        'meanings used here and document its own convention explicitly to '
        'avoid ambiguity in its reasoning chains.', B))
    return out


# ──────────────────────────────────────────────────────────────────────────
# CHAPTERS 5-10 — CONCEPT CATALOGUE
# ──────────────────────────────────────────────────────────────────────────
def _concept_entry(h, name, fields):
    """Render a concept entry in the 10-field schema as a styled block."""
    P, S, B = h['Paragraph'], h['Spacer'], h['BODY']
    H3, H4 = h['H3'], h['H4']
    out = []
    out.append(P(name, H3))
    for fname, fbody in fields:
        out.append(P(f'<b>{fname}.</b>  {fbody}', B))
    out.append(S(1, 6))
    return out


def ch5_structure(h):
    """Chapter 5 — Market Structure Concepts."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    _concept_entry = h['_concept_entry']

    out.append(P(
        '<i>Structure is the skeleton. Every zone, every pattern, every '
        'liquidity event is interpreted relative to the structure that '
        'contains it.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>5.1  The structure cluster</b>', H2))
    out.append(P(
        'Market structure is the sequence of swings that defines directional '
        'bias. It is the most foundational cluster in RTM because every '
        'other concept is interpreted relative to it: a demand zone that '
        'aligns with bullish structure is high-probability; the same zone '
        'against bearish structure is a trap. This chapter covers ten '
        'structure concepts in the standard ten-field schema: Market '
        'Structure, Swing, Impulse, Correction, Momentum, Strength, '
        'Weakness, BOS, CHoCH, and Curve.', B))

    entries = [
        ('Market Structure', [
            ('Definition', 'The ordered sequence of swing highs and swing lows that defines the directional bias of a chart. A series of higher highs and higher lows is bullish structure; lower highs and lower lows is bearish structure; overlapping swings is range structure.'),
            ('Purpose', 'Structure tells the trader which side of the market to trade. Longs in bullish structure, shorts in bearish structure, neither in range structure. Without structure, every zone is a 50/50 gamble.'),
            ('Context', 'Structure exists on every timeframe simultaneously. The professional reads structure on the highest relevant timeframe first, then descends. Structure on a lower timeframe is subordinate to structure on a higher timeframe.'),
            ('Why it forms', 'Structure is the cumulative footprint of institutional intent across many auctions. Higher highs form because institutional buyers are willing to pay higher prices over time; lower highs form because institutional sellers are willing to sell at lower prices.'),
            ('How professionals identify it', 'Connect the most recent significant swing highs with a line, and the most recent significant swing lows with a line. The slope and the relationship (HH/HL, LH/LL, or overlapping) define the structure. Use significant swings only — ignore minor wicks.'),
            ('Common mistakes', 'Treating every pivot as a swing; using wick extremes instead of body extremes; reading structure on too low a timeframe and missing the higher-timeframe bias; flip-flopping structure on every minor counter-move.'),
            ('Failure conditions', 'Structure does not "fail" — it shifts. A CHoCH is the early signal of a structural shift; a confirmed BOS in the opposite direction is the validation. Trading against a confirmed structural shift is the single most common RTM error.'),
            ('Relationship to other concepts', 'Structure is the parent of every other cluster. Zones are interpreted relative to structure; patterns are validated by structure; liquidity sits at structural swings; the curve is the highest-timeframe structure.'),
            ('Probability contribution', 'Aligned structure alone: ~55%. Aligned structure + fresh zone: ~70%. Counter-structure zone: ~35% — the base rate is inverted.'),
            ('Real chart example', 'EURUSD H1: price makes 1.0900 → 1.0870 → 1.0920 → 1.0885 → 1.0945. Higher highs (1.0900→1.0920→1.0945) and higher lows (1.0870→1.0885) define bullish structure. Longs at demand zones are now high-probability; shorts at supply are counter-structure and should be avoided.'),
        ]),
        ('Swing', [
            ('Definition', 'A pivot point on the chart where price reversed direction. A swing high is a peak followed by a lower high; a swing low is a trough followed by a higher low. Swings are the atomic units of structure.'),
            ('Purpose', 'Swings define the levels that must be broken for structure to continue or shift. They are also the most common location of liquidity — stops cluster just beyond them.'),
            ('Context', 'A swing must be confirmed by a counter-move of at least a few candles; a single-candle spike is not a swing. Swings are hierarchical: major swings on H4 are more significant than minor swings on M15.'),
            ('Why it forms', 'A swing high forms when buying pressure exhausts at a price where sellers were waiting (often a prior supply zone or a liquidity pool). A swing low forms symmetrically. The swing is the visible equilibrium point of that auction.'),
            ('How professionals identify it', 'A swing requires at least 2-3 candles of counter-move on each side to be valid. The swing extremum (wick or body, depending on convention) is the level. Professionals prefer body-based swings on lower timeframes and wick-based swings on higher timeframes.'),
            ('Common mistakes', 'Marking every wick as a swing; failing to require confirmation; treating inside bars as swings; mixing wick and body conventions within the same analysis.'),
            ('Failure conditions', 'A swing is invalidated only when price closes decisively beyond it AND the close holds. A wick beyond a swing that immediately reverses is a sweep, not a structural break.'),
            ('Relationship to other concepts', 'Swings define BOS and CHoCH; swings are where liquidity pools form; swings are the proximal/distal anchors of zones; the curve is the longest sequence of swings.'),
            ('Probability contribution', 'Swings alone are descriptive, not predictive. Their contribution comes from being broken (BOS) or swept (liquidity event).'),
            ('Real chart example', 'GBPUSD H4: price peaks at 1.2785, retraces 4 candles to 1.2720, then advances. The 1.2785 peak is a confirmed swing high. A close above 1.2785 is a BOS and confirms bullish continuation; a wick above 1.2785 that reverses is a sweep and signals potential distribution.'),
        ]),
        ('Impulse', [
            ('Definition', 'A directional move that breaks the prior swing in the trend direction. An impulse is the visible footprint of institutional aggression — large, fast, decisive.'),
            ('Purpose', 'Impulses confirm institutional intent. A zone preceded by an impulse is high-quality; a zone preceded by a slow drift is low-quality. Impulses also create the FTR that confirms the move.'),
            ('Context', 'Impulses occur after bases (the institutional pause) and after liquidity sweeps (the IPDA\'s fuel-gathering). They rarely occur in mid-correction.'),
            ('Why it forms', 'An institution with a large position to fill becomes the dominant aggressor. Its orders exhaust the opposing side, and price moves decisively. The impulse is the visible result of that dominance.'),
            ('How professionals identify it', 'An impulse has (1) above-average range relative to recent candles, (2) large body proportion (≥70% body, minimal wicks), (3) minimal overlap with prior candles, (4) closes near its extremum, (5) breaks structure.'),
            ('Common mistakes', 'Treating any large candle as an impulse (it must also break structure); ignoring the body proportion; marking impulses inside corrections.'),
            ('Failure conditions', 'An impulse fails when the next candle reclaims ≥50% of its range — that is a sign of absorption, not aggression. The impulse then becomes a liquidity event, not a directional commitment.'),
            ('Relationship to other concepts', 'Impulses are produced by bases; impulses create BOS and FTR; impulses define zone quality (the departure); impulses are the engine of the curve.'),
            ('Probability contribution', 'Strong impulse as departure from a base: +10–15% lift to the zone\'s reaction probability. Weak departure: −15% (the zone is suspect).'),
            ('Real chart example', 'BTC Daily: after a 3-day base at 60k-62k, price fires a single daily candle from 61k to 66k, body 95% of range, close near high, breaks the prior swing at 63.5k. This is a textbook impulse and certifies the base as a high-quality demand zone.'),
        ]),
        ('Correction', [
            ('Definition', 'A counter-trend move that does NOT break the prior swing in the trend direction. Corrections are the visible footprint of opposing absorption — shallow, overlapping, slow.'),
            ('Purpose', 'Corrections are where the professional waits. Entering during a correction (in the trend direction) is the highest-probability entry, because the correction is the institutional pause that precedes the next impulse.'),
            ('Context', 'Corrections occur after impulses and before the next impulse. The depth of the correction (38%, 50%, 62% of the impulse) reveals the strength of the trend: shallow = strong, deep = weak.'),
            ('Why it forms', 'After an institutional impulse, profit-taking and counter-trend participants create a temporary counter-flow. If the institution intends to continue, it absorbs this counter-flow without allowing structure to break.'),
            ('How professionals identify it', 'A correction has (1) overlapping candles, (2) smaller ranges than the preceding impulse, (3) does not break the prior swing, (4) often forms a flag or compression at its extremes.'),
            ('Common mistakes', 'Treating every pullback as a correction (some are the start of a reversal); entering mid-correction instead of at a zone; ignoring the depth signal.'),
            ('Failure conditions', 'A correction fails when it breaks the prior swing — at that moment it is no longer a correction, it is the first leg of a reversal (CHoCH). The trader must immediately re-read structure.'),
            ('Relationship to other concepts', 'Corrections contain flags and compressions; corrections terminate at zones (the prior base) and flag limits; corrections are the setup for the next impulse.'),
            ('Probability contribution', 'A shallow correction to a fresh zone in trend direction: high-probability entry. A deep correction approaching the origin of the prior impulse: lower probability, structure is weakening.'),
            ('Real chart example', 'ES H1: after an impulse from 4500 to 4540, price pulls back in 5 overlapping candles to 4525, holds the 4520 zone, and resumes up. The pullback to 4525 is a correction; entering long at 4525 with stop below 4520 is the textbook continuation entry.'),
        ]),
        ('Momentum', [
            ('Definition', 'The strength of an impulse, measured by range, body proportion, and time taken. Momentum is a continuous property — impulses have it in varying degrees.'),
            ('Purpose', 'Momentum certifies institutional commitment. A high-momentum departure from a zone confirms the zone; a low-momentum departure makes the zone suspect.'),
            ('Context', 'Momentum is evaluated at the moment of departure from a base and at the moment of reaction to a zone. Both readings matter.'),
            ('Why it forms', 'Momentum is proportional to the size of the institutional order flow relative to the available liquidity. Large orders + thin liquidity = explosive momentum.'),
            ('How professionals identify it', 'Quantitatively: range percentile (top 20% of recent candles), body proportion (≥70%), close near extremum, time to traverse the range (faster = stronger). Qualitatively: the candle "looks" institutional — clean, no hesitation.'),
            ('Common mistakes', 'Treating a single large candle as momentum without checking structure; ignoring wick proportion; confusing volatility with momentum.'),
            ('Failure conditions', 'Momentum fails when the next candle absorbs it (≥50% retracement). At that point the impulse was likely a liquidity sweep, not a directional commitment.'),
            ('Relationship to other concepts', 'Momentum is a property of impulses; momentum contributes to zone quality (the departure); momentum is required for a valid BOS.'),
            ('Probability contribution', 'High-momentum departure from a base: +12% lift. Low-momentum departure: −10%. The momentum of the departure is one of the strongest single predictors of zone quality.'),
            ('Real chart example', 'EURUSD M15: a base at 1.0830-1.0838 fires a single M15 candle from 1.0835 to 1.0865, body 88%, close 2 pips from high, breaks the M15 swing at 1.0850 in one candle. High-momentum departure; the zone is high-quality.'),
        ]),
        ('Strength', [
            ('Definition', 'A property of a move indicating institutional commitment. Strength is a composite: large bodies, minimal wicks, decisive structure breaks, minimal overlap with prior candles.'),
            ('Purpose', 'Strength separates real institutional moves from retail-driven noise. Trading only strong moves is one of the simplest edges in RTM.'),
            ('Context', 'Strength is evaluated on every move — impulses, departures, engulfs, sweeps. A strong engulf at a zone is a buy/sell signal; a weak engulf is noise.'),
            ('Why it forms', 'Strength reflects the ratio of institutional order flow to retail order flow. When institutions dominate, the move is strong; when retail dominates, the move is weak and choppy.'),
            ('How professionals identify it', 'Body proportion ≥70%, range ≥1.5× ATR(20), close in the top/bottom 25% of the range, minimal wicks (<30% of range), breaks structure decisively (no wick back through).'),
            ('Common mistakes', 'Treating any large candle as strong (it must also have minimal wicks); ignoring the close position; treating strength as binary instead of continuous.'),
            ('Failure conditions', 'Strength is invalidated by a weak follow-through candle. A strong engulf followed by a doji is a warning sign; the institutional commitment is questionable.'),
            ('Relationship to other concepts', 'Strength is a property of impulses and engulfs; strength contributes to zone quality; strength is required for high-probability BOS.'),
            ('Probability contribution', 'Strong departure from a base: +12%. Strong engulf at a fresh zone: +10%. Weak versions of either: −10%.'),
            ('Real chart example', 'GBPJPy H1: a 4-candle base at 192.50-192.80 fires a single H1 candle: open 192.55, close 193.40, high 193.45, low 192.50. Body 85% of range, close in top 5%, no upper wick to speak of, breaks the prior swing high at 193.10. Textbook strength.'),
        ]),
        ('Weakness', [
            ('Definition', 'A property of a move indicating lack of institutional commitment: small bodies, large wicks, overlapping ranges, shallow structure breaks, hesitation.'),
            ('Purpose', 'Weakness warns the professional that the move is retail-driven and likely to fail. Avoiding weak moves is as important as trading strong ones.'),
            ('Context', 'Weakness is evaluated on the same moves as strength. A weak departure from a base makes the base suspect; a weak engulf at a zone is not an entry trigger.'),
            ('Why it forms', 'Weakness reflects the absence of institutional dominance. Retail order flow is fragmented and produces choppy, overlapping candles with large wicks as opposing flow absorbs each push.'),
            ('How professionals identify it', 'Body proportion <50%, range <1.0× ATR(20), close in the middle 50% of the range, large wicks (>30% of range), fails to break structure cleanly.'),
            ('Common mistakes', 'Treating a weak move as a "small impulse" (it is not an impulse at all); entering on weak engulfs; ignoring weakness at zone reactions.'),
            ('Failure conditions', 'Weakness is not invalidated; it is reinforced by subsequent weak candles. A weak move followed by another weak move is a strong signal of distribution or accumulation against the apparent direction.'),
            ('Relationship to other concepts', 'Weakness is the opposite of strength; weakness invalidates zone quality; weakness at a flag limit suggests the flag will fail; weakness after a sweep suggests the sweep is fake.'),
            ('Probability contribution', 'Weak departure from a base: −15% (do not trade the base). Weak engulf at a zone: −12% (wait for confirmation).'),
            ('Real chart example', 'SPX500 H4: a base at 4520-4530 fires a candle that opens 4525, reaches 4555, but closes at 4538 — body 30% of range, large upper wick. Despite breaking the prior swing at 4540, the close is weak. The "impulse" is suspect; the next 2 candles reverse back below 4540. The base should not be traded as a demand zone.'),
        ]),
        ('BOS — Break of Structure', [
            ('Definition', 'A close beyond the prior swing high (bullish BOS) or swing low (bearish BOS) that confirms trend continuation. BOS is the structural validation of an impulse.'),
            ('Purpose', 'BOS is the confirmation signal. Without BOS, an apparent impulse is just a candle; with BOS, it is a confirmed directional move that creates a fresh zone at its origin.'),
            ('Context', 'BOS occurs at the end of an impulse. The candle that closes beyond the swing is the BOS candle. The base that preceded the impulse is now a confirmed zone.'),
            ('Why it forms', 'BOS forms because the institution\'s aggression exhausted all opposing liquidity at the prior swing. With no opposing flow, price advances beyond the prior high/low and closes there.'),
            ('How professionals identify it', 'Require a <i>close</i> beyond the swing, not just a wick. The close should be decisive (not 1 pip beyond). On lower timeframes, accept body closes; on higher timeframes, prefer full-candle closes.'),
            ('Common mistakes', 'Treating a wick beyond the swing as BOS (it is a sweep, not a BOS); accepting a marginal close (1-2 pips) as BOS; flip-flopping structure on every minor BOS.'),
            ('Failure conditions', 'A BOS fails when the next candle reclaims the swing level and closes back inside. This is a fake BOS — a common liquidity event. The trader must wait for confirmation.'),
            ('Relationship to other concepts', 'BOS confirms impulses; BOS validates the base as a zone; BOS is the opposite of CHoCH; BOS on a higher timeframe overrides conflicting BOS on a lower timeframe.'),
            ('Probability contribution', 'Valid BOS as confirmation of a base: +15%. A zone whose departure has BOS is roughly 3× more likely to react than one without.'),
            ('Real chart example', 'NAS100 M15: prior swing high at 15640. After a base, an M15 candle closes at 15655 — body close, not wick. The BOS is valid. The base at the origin of this move is now a confirmed demand zone.'),
        ]),
        ('CHoCH — Change of Character', [
            ('Definition', 'A close beyond the most recent counter-trend swing, signalling potential reversal of intent. CHoCH is the early warning of a structural shift; a confirmed BOS in the new direction validates it.'),
            ('Purpose', 'CHoCH is the earliest structural signal that a trend may be reversing. It is not an entry signal on its own — it is a context signal that allows the trader to start looking for reversal setups.'),
            ('Context', 'CHoCH occurs at the end of a trend, typically after a liquidity sweep. The sweep provides the fuel; the CHoCH is the first structural sign that intent has shifted.'),
            ('Why it forms', 'CHoCH forms because the institution that was driving the trend has finished accumulating/distributing and has reversed position. The counter-trend aggression now dominates, breaking the prior counter-trend swing.'),
            ('How professionals identify it', 'In an uptrend, CHoCH is a close below the most recent higher low. In a downtrend, CHoCH is a close above the most recent lower high. Require a decisive close, not a marginal one. Look for prior liquidity sweep as confirmation.'),
            ('Common mistakes', 'Treating every counter-trend close as CHoCH (require significance); entering immediately on CHoCH without waiting for confirmation; ignoring the higher-timeframe context (CHoCH on M15 is meaningless if H4 structure is still bullish).'),
            ('Failure conditions', 'CHoCH fails when the next candle reclaims the broken swing. This is a fake CHoCH — common in ranges. The trader must wait for a BOS in the new direction to confirm the reversal.'),
            ('Relationship to other concepts', 'CHoCH is the predecessor to a reversal BOS; CHoCH typically follows a liquidity sweep; CHoCH is the structural signal that confirms QM and Diamond reversal patterns; CHoCH on a higher timeframe overrides lower-timeframe structure.'),
            ('Probability contribution', 'CHoCH alone: ~50% (unconfirmed). CHoCH + prior liquidity sweep: ~62%. CHoCH + sweep + BOS confirmation: ~72%.'),
            ('Real chart example', 'EURUSD H1: uptrend, last HL at 1.0920. Price sweeps 1.0940 (prior HH — buy-side liquidity), then reverses sharply and closes at 1.0910 — below the HL. This is CHoCH. The trader now looks for shorts on the next pullback; a close below 1.0880 (next lower structure) would be the confirming BOS.'),
        ]),
        ('Curve', [
            ('Definition', 'The directional bias inherited from the highest relevant timeframe. The curve is the gravitational field inside which every lower-timeframe pattern operates; patterns aligned with the curve are amplified, patterns against it are suppressed.'),
            ('Purpose', 'The curve is the single most important context in RTM. It decides whether a zone is high-probability or a trap. A professional never trades against the curve without an explicit, structural reason.'),
            ('Context', 'The curve is set on the highest timeframe the institution uses to define its intent — typically Weekly or Daily for swing traders, H4 for intraday traders. The curve is reviewed at the start of every session.'),
            ('Why it forms', 'The curve reflects the largest institutional positions. These positions take weeks or months to build and unwind; their direction dominates all lower-timeframe activity until they are closed.'),
            ('How professionals identify it', 'Identify the highest relevant timeframe. Read its structure (HH/HL = bullish curve, LH/LL = bearish curve, overlapping = neutral). Identify the active HTF zone. The curve is bullish if price is above the HTF demand zone with bullish HTF structure; bearish if below the HTF supply zone with bearish structure.'),
            ('Common mistakes', 'Setting the curve on too low a timeframe; flip-flopping the curve on every HTF correction; ignoring the curve when a "perfect" LTF setup appears against it; failing to revisit the curve when HTF structure shifts.'),
            ('Failure conditions', 'The curve does not fail — it shifts. A CHoCH on the HTF is the early signal of a curve shift; a BOS confirms it. Until confirmation, the old curve remains in effect.'),
            ('Relationship to other concepts', 'The curve is the highest-timeframe structure; the curve constrains every lower-timeframe pattern; the curve is the primary input to zone quality scoring; curve misalignment is the #1 cause of zone failure.'),
            ('Probability contribution', 'Curve-aligned zone: +20% lift over the base rate. Curve-misaligned zone: −25% (the base rate is inverted). The curve is the single largest probability modifier in RTM.'),
            ('Real chart example', 'EURUSD Weekly: HH/HL structure, last weekly demand at 1.0800-1.0850, price currently 1.0920. Weekly curve is bullish. On H1, a fresh demand zone at 1.0870 is high-probability (curve-aligned). A supply zone at 1.0940 is low-probability (curve-misaligned) and should be skipped or traded only with a tight invalidation.'),
        ]),
    ]

    for name, fields in entries:
        out.extend(_concept_entry(name, fields))

    out.append(P('<b>5.2  Relationship map — the structure cluster</b>', H2))
    out.append(P(
        'The ten structure concepts form a tightly connected cluster. The '
        'curve is the apex: it is the highest-timeframe structure, and it '
        'constrains all lower-timeframe structure. Swings are the atomic '
        'units; impulses and corrections are the two kinds of moves '
        'composed of swings; momentum, strength, and weakness are '
        'properties of impulses. BOS and CHoCH are the events that '
        'confirm or shift structure. Market structure itself is the '
        'sequence of swings read as a whole.', B))
    out.append(S(1, 6))
    out.append(CL('Structure cluster edges', [
        'curve → constrains → market_structure (HTF overrides LTF)',
        'market_structure → composed_of → swings',
        'impulse → breaks_swing → creates_BOS',
        'correction → fails_to_break_swing → preserves_structure',
        'momentum → modifies → impulse',
        'strength / weakness → properties_of → impulse',
        'CHoCH → precedes → reversal_BOS',
        'CHoCH → triggered_by → liquidity_sweep (typically)',
        'curve_shift → invalidates → LTF_patterns_aligned_with_old_curve',
    ]))
    return out

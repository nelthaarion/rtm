"""
RTM Knowledge Base - Chapter builders (Part 2: chapters 6-18).
"""


def ch6_zones(h):
    """Chapter 6 — Zone Concepts."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    _concept_entry = h['_concept_entry']

    out.append(P(
        '<i>Zones are where the IPDA must react. A zone is not a level on '
        'a chart — it is a price band containing real, unfilled '
        'institutional orders.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>6.1  The zone cluster</b>', H2))
    out.append(P(
        'Zones are the second foundational cluster in RTM, immediately '
        'after structure. A zone is the price band within which an '
        'institution accumulated or distributed its position; the unfilled '
        'remnant of that inventory sits there and reacts when price '
        'returns. This chapter covers eleven zone concepts: Supply, '
        'Demand, Base (revisited from the zone perspective), Fresh Zone, '
        'Consumed Zone, Decision Point, Zone Quality, Nested Zones, '
        'Arrival, Departure, and Reaction. The chapter closes with the '
        'Zone Quality Scoring framework — the five dimensions a '
        'professional uses to rank zones by reaction probability.', B))

    entries = [
        ('Supply', [
            ('Definition', 'A price band containing unfilled institutional sell orders, left behind after a distribution event. When price returns to a supply zone, the remaining sell orders are matched and price tends to react downward.'),
            ('Purpose', 'Supply zones are short setups. The professional enters short when price returns to a fresh supply zone aligned with a bearish curve, with a stop above the zone and a target at the next lower demand.'),
            ('Context', 'Forms at the origin of a downward impulse — the base from which price departed downward. Located above the current price, waiting to be revisited on a retracement.'),
            ('Why it forms', 'When an institution distributes a long position, it cannot sell everything at the top — some orders rest unfilled at the upper end of the distribution band. Those orders sit there until price returns and fills them, regardless of how long it takes.'),
            ('How professionals identify it', 'Find a sharp downward departure from a base. The zone is the base itself: proximal line = the base high, distal line = the base low. The departure must be impulsive, must break structure, and the zone must be fresh (untouched).'),
            ('Common mistakes', 'Marking every pullback as supply; marking a zone without a clear departure; treating a zone that has been touched multiple times as fresh; ignoring the curve (a supply zone in a bullish curve is a low-probability short).'),
            ('Failure conditions', 'A supply zone fails when price returns and closes decisively above the proximal line. At that point the unfilled inventory has been absorbed — the institution either finished selling or was overwhelmed by stronger buyers. The zone is consumed.'),
            ('Relationship to other concepts', 'Supply is the mirror of Demand; every Supply zone has a Base at its origin; Supply is amplified by FTR (no return = strong sellers); Supply is invalidated by curve shift (bullish curve makes bearish Supply a trap).'),
            ('Probability contribution', 'Fresh Supply alone: ~50%. + Curve alignment: ~65%. + FTR + Nested HTF Supply: ~75%. Consumed Supply: drops 5-10% per touch.'),
            ('Real chart example', 'EURUSD H4: price spikes from 1.1050 to 1.1120 in one candle, then collapses to 1.0900. The base at 1.1050-1.1120 is a Supply zone. Three weeks later price retraces to 1.1085 and reverses sharply. The unfilled sell orders above 1.1050 were filled; price reacted down.'),
        ]),
        ('Demand', [
            ('Definition', 'A price band containing unfilled institutional buy orders, left behind after an accumulation event. When price returns to a demand zone, the remaining buy orders are matched and price tends to react upward.'),
            ('Purpose', 'Demand zones are long setups. The professional enters long when price returns to a fresh demand zone aligned with a bullish curve, with a stop below the zone and a target at the next higher supply.'),
            ('Context', 'Forms at the origin of an upward impulse — the base from which price departed upward. Located below the current price, waiting to be revisited on a retracement.'),
            ('Why it forms', 'When an institution accumulates a long position, it cannot buy everything at the bottom — some orders rest unfilled at the lower end of the accumulation band. Those orders sit there until price returns and fills them.'),
            ('How professionals identify it', 'Find a sharp upward departure from a base. The zone is the base itself: proximal line = the base low, distal line = the base high. The departure must be impulsive, must break structure, and the zone must be fresh.'),
            ('Common mistakes', 'Same as Supply, mirrored. Additionally, treating the wick of a single candle as a demand zone (a zone needs a base, not a wick).'),
            ('Failure conditions', 'A demand zone fails when price returns and closes decisively below the proximal line. The unfilled buy orders have been absorbed — the institution either finished buying or was overwhelmed by stronger sellers. The zone is consumed.'),
            ('Relationship to other concepts', 'Demand is the mirror of Supply; every Demand zone has a Base at its origin; Demand is amplified by FTR; Demand is invalidated by curve shift.'),
            ('Probability contribution', 'Fresh Demand alone: ~50%. + Curve alignment: ~65%. + FTR + Nested HTF Demand: ~75%.'),
            ('Real chart example', 'BTC Daily: price compresses at 58k-60k for 4 days, then fires upward to 70k in 3 candles. The 58k-60k base is a Demand zone. Price retraces to 60.5k two weeks later and bounces 15%. The unfilled buy orders below 60k held; price reacted up.'),
        ]),
        ('Base (zone perspective)', [
            ('Definition', 'The base reconsidered as the structural origin of a zone. Every valid zone has a base at its origin; the base\'s extremum defines the proximal line of the zone, and the base\'s opposite end defines the distal line.'),
            ('Purpose', 'Identifying the base precisely determines the zone\'s boundaries. A poorly placed proximal line means a poorly placed stop, and a poorly placed stop means a losing trade even when the analysis is correct.'),
            ('Context', 'Bases are 1-6 candle consolidations immediately preceding an impulsive departure. They appear on every timeframe, but only bases whose departure breaks structure on their own timeframe qualify as zone origins.'),
            ('Why it forms', 'The base is the institutional pause — the moment when the institution is absorbing opposing flow without committing directionally. The departure is the moment the institution commits. Without the base, there is no institutional footprint; without the departure, the base is unconfirmed.'),
            ('How professionals identify it', 'Three checks: (1) compact range with overlapping candles, (2) at the origin of an impulse that breaks structure, (3) the impulse is strong (large body, minimal wicks). All three required.'),
            ('Common mistakes', 'Drawing zones from a single candle instead of a base; drawing zones from a base whose departure is weak; marking the proximal line at the wick when the body is more significant on lower timeframes.'),
            ('Failure conditions', 'A base-as-zone-origin fails when the departure is reclaimed (price returns and breaks back through the base in the opposite direction). The institutional intent that produced the base is invalidated.'),
            ('Relationship to other concepts', 'Base is part-of every Supply and Demand zone; Base precedes Engulf and FTR; Base quality determines zone quality; Base is confirmed by BOS.'),
            ('Probability contribution', 'Strong base + strong departure: ~55% base rate. Weak base or weak departure: ~40%. Without a base, there is no zone.'),
            ('Real chart example', 'Gold H1: 5 candles compress at 2010-2015, then a single H1 candle fires to 2035, body 92%, close near high, breaks prior swing at 2025. The base 2010-2015 is the zone origin; proximal line 2010, distal line 2015. Stop below 2010, target at the next supply.'),
        ]),
        ('Fresh Zone', [
            ('Definition', 'A zone that has not yet been touched by a return move. The full unfilled institutional inventory remains in the zone. Freshness is the single most important zone-quality dimension.'),
            ('Purpose', 'Fresh zones are the only zones worth trading in isolation. A fresh zone aligned with the curve is a high-probability setup; the same zone after one touch is a 50/50 gamble; after two touches it is a trap.'),
            ('Context', 'Freshness is binary at any moment — either price has returned to the zone or it has not. Once price touches the proximal line, the zone is no longer fresh; it is "first-touch" and then "consumed".'),
            ('Why it forms', 'Freshness reflects untapped institutional inventory. When the institution departed the base, it left orders behind. Those orders are still there until price returns and fills them. The first return is when the strongest reaction occurs.'),
            ('How professionals identify it', 'After marking a zone, scan the price action since the zone was created. If no candle has returned to the zone\'s price band, the zone is fresh. If even one candle has touched the proximal line, the zone is no longer fresh.'),
            ('Common mistakes', 'Treating a zone touched on a lower timeframe as fresh on a higher timeframe (timeframe mismatch); ignoring wick touches (a wick touch counts); treating a zone as fresh after a long time has passed (freshness decays with time even without a touch).'),
            ('Failure conditions', 'Freshness is lost on the first touch. There is no "mostly fresh" — once touched, the zone\'s probability drops immediately. The decay is non-linear: first touch -10%, second touch -20%, third touch -30%, beyond that the zone is effectively consumed.'),
            ('Relationship to other concepts', 'Freshness is the primary input to Zone Quality; Freshness is required for a "must-react" classification; Freshness decays into Consumed Zone; Freshness is preserved by FTR (no return keeps it fresh).'),
            ('Probability contribution', 'Fresh zone: base rate. First touch: -10%. Second touch: -25% cumulative. Third touch: -50% cumulative. The first-touch decay is the largest single probability modifier in zone trading.'),
            ('Real chart example', 'SPX500 H4: a fresh demand zone at 4500-4520 created 3 weeks ago. Price has not returned since. Today price drops to 4515 — the zone is fresh, and the reaction probability is the highest it will ever be. After this reaction (success or failure), the zone is no longer fresh.'),
        ]),
        ('Consumed Zone', [
            ('Definition', 'A zone that has been touched at least once since creation. Each touch has filled some of the unfilled institutional inventory; the remaining reaction probability is reduced proportionally.'),
            ('Purpose', 'Consumed zones are still tradeable but only with explicit confirmation. The professional does not blindly enter on a consumed zone — they wait for an engulf, a compression breakout, or a sweep failure before committing.'),
            ('Context', 'A zone becomes consumed on the first touch. The degree of consumption scales with the number of touches, the depth of penetration into the zone, and the time elapsed since creation.'),
            ('Why it forms', 'Each touch fills some orders. The institution that left the orders may have already finished its position; the remaining orders are weaker with each touch. Eventually the zone is "empty" — no significant unfilled inventory remains.'),
            ('How professionals identify it', 'Count the touches since zone creation. One touch = lightly consumed (still tradeable with confirmation). Two touches = moderately consumed (require strong confirmation). Three+ touches = fully consumed (treat as a level of interest, not a zone).'),
            ('Common mistakes', 'Treating a heavily consumed zone as fresh because "it hasn\'t touched in a while"; trading consumed zones without confirmation; expecting the same reaction strength as a fresh zone.'),
            ('Failure conditions', 'A consumed zone is in a slow failure state from the first touch. By the third touch, the zone is structurally invalid — any reaction is noise, not institutional.'),
            ('Relationship to other concepts', 'Consumed Zone is the decayed state of a Fresh Zone; Consumed zones still contribute to Decision Points; Consumed zones are invalidated by Curve shift faster than Fresh zones; Consumed zones are lower-priority inputs to Zone Quality.'),
            ('Probability contribution', 'Lightly consumed (1 touch): -10% from fresh. Moderately consumed (2 touches): -25%. Fully consumed (3+ touches): -50% — equivalent to no zone.'),
            ('Real chart example', 'EURUSD H1: a demand zone at 1.0800-1.0820 created 6 weeks ago. Price has touched 1.0815 once (3 weeks ago, bounced), and 1.0810 once (yesterday, bounced weakly). The zone is moderately consumed; the next touch should be traded only with a strong engulf or compression confirmation.'),
        ]),
        ('Decision Point', [
            ('Definition', 'A price level where multiple structures converge — a zone, a swing, a flag limit, a higher-timeframe zone edge — forcing the IPDA to make a decision. Decision points have higher reaction probability than any single structure in isolation.'),
            ('Purpose', 'Decision points are the highest-probability trade locations in RTM. A professional concentrates capital at decision points and ignores isolated zones. The convergence of structures amplifies the reaction probability multiplicatively.'),
            ('Context', 'Decision points are identified by overlaying multiple structure types on the same chart. Where 3+ structures cluster at the same price, that price is a decision point. The more structures, the stronger the point.'),
            ('Why it forms', 'Each structure at a decision point represents independent institutional interest. When price reaches the convergence, multiple institutions are forced to act simultaneously — their combined order flow creates an outsized reaction.'),
            ('How professionals identify it', 'Mark all zones (supply and demand) on the chart. Mark all significant swings. Mark all flag limits. Mark all higher-timeframe zone edges. Look for clusters of 3+ within a tight price band (typically <0.2% wide). Those clusters are decision points.'),
            ('Common mistakes', 'Counting the same structure twice (e.g., a swing that is also a zone edge as two separate structures); treating any two-point convergence as a decision point (need 3+); ignoring time — a decision point from 2 years ago is less relevant than one from 2 weeks ago.'),
            ('Failure conditions', 'A decision point fails when one of its component structures is invalidated (e.g., a zone in the cluster is consumed and broken). The convergence loses its force with each component that fails.'),
            ('Relationship to other concepts', 'Decision Point is the convergence of Zone, Swing, Flag Limit, and HTF Zone; Decision Point amplifies every pattern that occurs at it; Decision Point is the highest-quality input to Zone Quality scoring.'),
            ('Probability contribution', 'Decision point (3+ structures): +20% over the strongest single structure. Decision point with 5+ structures: +30%. Decision points are the single highest-probability trade locations in RTM.'),
            ('Real chart example', 'GBPUSD H1: at 1.2680, there is (1) an H1 demand zone edge, (2) a major H4 swing low, (3) the FL of a recent flag, (4) the proximal line of a daily demand zone. Four structures converge at 1.2680 — a decision point. When price reaches 1.2680, the reaction is far more likely and more violent than at any single zone.'),
        ]),
        ('Zone Quality', [
            ('Definition', 'A composite score ranking zones by reaction probability. The score combines five dimensions: freshness, departure strength, curve alignment, nested confluence, and positional strength. Zone quality is the output of the zone engine; it determines trade sizing and priority.'),
            ('Purpose', 'Zone quality is how the professional decides which zones to trade and which to skip. High-quality zones get full position size; medium-quality get reduced size or require confirmation; low-quality get skipped. Without quality scoring, every zone is treated equally and the edge evaporates.'),
            ('Context', 'Quality is computed at zone creation and recomputed on every touch and every curve shift. A zone that was high-quality at creation can become low-quality over time as freshness decays or the curve shifts.'),
            ('Why it forms', 'Quality reflects the underlying institutional commitment. A zone with strong departure, fresh inventory, curve alignment, and HTF confluence represents strong institutional commitment; a zone without these represents weak or absent commitment.'),
            ('How professionals identify it', 'Score each dimension 0-2: freshness (2 = untouched, 1 = first touch, 0 = consumed), departure strength (2 = impulsive + BOS, 1 = impulsive no BOS, 0 = weak), curve alignment (2 = aligned with HTF, 1 = neutral, 0 = counter-curve), nested confluence (2 = nested in HTF zone, 1 = adjacent, 0 = none), positional strength (2 = at major swing, 1 = at minor swing, 0 = no swing). Sum: 0-4 = low, 5-6 = medium, 7-10 = high.'),
            ('Common mistakes', 'Weighting all dimensions equally (curve alignment is most important); failing to recompute quality after touches; treating quality as static; ignoring positional strength (a zone at a major swing is qualitatively different from one in no-man\'s land).'),
            ('Failure conditions', 'Quality is a snapshot, not a guarantee. A high-quality zone can still fail if the curve shifts between creation and the return. The professional monitors curve stability throughout the trade.'),
            ('Relationship to other concepts', 'Zone Quality is the output of the zone engine; Zone Quality is the input to trade sizing; Zone Quality is modified by every other zone concept (freshness, departure, curve, nesting, position).'),
            ('Probability contribution', 'Quality score 9-10: ~75% reaction probability. Quality 5-6: ~55%. Quality 0-4: ~35% — worse than coin flip; skip.'),
            ('Real chart example', 'A demand zone scores: freshness 2 (untouched), departure 2 (impulsive + BOS), curve 2 (bullish HTF), nested 2 (inside daily demand), position 1 (at minor swing). Total 9 — high quality. Trade full size. Another demand zone scores 4 (touched once, weak departure, neutral curve, no nesting, no position) — low quality; skip.'),
        ]),
        ('Nested Zones', [
            ('Definition', 'Two or more zones of different timeframes that overlap in price. A nested zone is multi-timeframe confluence — the same price band contains unfilled institutional inventory on multiple timeframes, amplifying reaction probability.'),
            ('Purpose', 'Nested zones are the highest-probability zone setups in RTM. The professional actively hunts for nesting; a zone that is nested inside an HTF zone is a must-react candidate; a zone that stands alone is only a may-react candidate.'),
            ('Context', 'Nesting is identified by drawing zones on multiple timeframes and looking for overlaps. A typical nesting hierarchy: Monthly → Weekly → Daily → H4 → H1. The more timeframes nested, the stronger the confluence.'),
            ('Why it forms', 'Institutions operating on different timeframes build positions at the same price levels — major swing points are visible to all participants. When a daily demand zone and an H1 demand zone overlap, both daily-scale and H1-scale institutions have unfilled inventory there.'),
            ('How professionals identify it', 'Draw zones on the HTF (e.g., Daily). Drop to the LTF (e.g., H1) and draw zones there. Where an H1 zone\'s price band falls inside a Daily zone\'s price band, the H1 zone is nested. The HTF zone is the parent; the LTF zone is the child.'),
            ('Common mistakes', 'Treating adjacent (non-overlapping) zones as nested; ignoring the HTF zone\'s freshness (a nested LTF zone inside a consumed HTF zone is much weaker); counting the same zone on multiple timeframes as nesting (it must be different zones).'),
            ('Failure conditions', 'Nesting fails when the HTF parent zone is broken. At that point the LTF child zone\'s nesting confluence is gone; the child zone reverts to standalone quality.'),
            ('Relationship to other concepts', 'Nested Zones is the primary MTF confluence; Nested Zones amplify Zone Quality; Nested Zones are required for "must-react" classification; Nested Zones are the engine of top-down analysis.'),
            ('Probability contribution', 'Single zone: base rate. Nested in one HTF zone: +12%. Nested in two HTF zones (e.g., H1 inside Daily inside Weekly): +22%. Nesting is the second-largest probability modifier after curve alignment.'),
            ('Real chart example', 'EURUSD: Daily demand zone at 1.0800-1.0860. Weekly demand zone at 1.0780-1.0870. H1 demand zone at 1.0820-1.0845. The H1 zone is nested inside both Daily and Weekly demand — triple nesting. When price reaches 1.0830, the reaction probability is extremely high; this is a must-react location.'),
        ]),
        ('Arrival', [
            ('Definition', 'The manner in which price approaches a zone. Impulsive arrival (strong directional move into the zone) indicates institutional intent; choppy arrival (overlapping, slow drift) indicates retail-driven approach. Arrival quality predicts reaction quality.'),
            ('Purpose', 'Arrival is the entry timing filter. A high-quality zone with choppy arrival is a low-probability trade; the same zone with impulsive arrival is a high-probability trade. The professional waits for impulsive arrival before committing.'),
            ('Context', 'Arrival is assessed on the timeframe of the zone and the timeframe immediately below. The last 3-5 candles before the zone touch are the arrival candles.'),
            ('Why it forms', 'Impulsive arrival forms when an institution is pushing price toward the zone to fill remaining orders (often its own). Choppy arrival forms when retail order flow is meandering toward the zone without institutional push.'),
            ('How professionals identify it', 'Look at the last 3-5 candles before the zone touch. If they are impulsive (large bodies, minimal overlap, decisive direction), arrival is strong. If they are choppy (small bodies, large wicks, overlapping ranges), arrival is weak. If arrival is impulsive AND there is a liquidity pool just beyond the zone, suspect a sweep setup.'),
            ('Common mistakes', 'Ignoring arrival entirely; treating a slow drift as impulsive because the cumulative move is large; confusing volatility with impulsiveness.'),
            ('Failure conditions', 'Arrival assessment fails when the arrival is faked — an apparent impulsive arrival that immediately reverses at the zone is a liquidity sweep, not a real arrival. The professional requires the arrival to commit (close beyond the zone) before treating it as real.'),
            ('Relationship to other concepts', 'Arrival is the precursor to Reaction; Arrival quality modifies Zone Quality at the moment of the touch; Impulsive arrival + liquidity beyond the zone = sweep setup; Choppy arrival + fresh zone = patience required.'),
            ('Probability contribution', 'Impulsive arrival at a fresh zone: +10%. Choppy arrival at a fresh zone: -5%. Impulsive arrival that becomes a sweep failure: +20% (reversal setup).'),
            ('Real chart example', 'EURUSD H1 demand at 1.0820-1.0840. Price approaches with three large bearish candles from 1.0880 to 1.0835 — strong impulsive arrival. The probability of a reaction at the zone is high. Compare: if price approached the same zone in 8 overlapping candles from 1.0860 to 1.0835, arrival would be choppy and the reaction probability lower.'),
        ]),
        ('Departure', [
            ('Definition', 'The manner in which price leaves a zone. Strong departure (impulsive, breaks structure, minimal wicks) confirms institutional commitment; weak departure (small bodies, large wicks, no structure break) signals absorption and probable failure.'),
            ('Purpose', 'Departure is the confirmation signal. The professional does not hold a zone trade hoping for a reaction — they require strong departure within a small number of candles to confirm the zone is holding. Weak departure triggers an exit.'),
            ('Context', 'Departure is assessed on the candles immediately after the zone touch. Typically 1-3 candles. The first candle after the touch is the most important; it should be impulsive in the reaction direction.'),
            ('Why it forms', 'Strong departure forms when the unfilled institutional inventory is being filled aggressively — the institution is back in the market as the dominant aggressor. Weak departure forms when there is no institutional aggression; the zone is being absorbed without commitment.'),
            ('How professionals identify it', 'After the zone touch, look for: (1) a candle that closes beyond the zone\'s proximal line in the reaction direction, (2) large body proportion (≥70%), (3) minimal wicks, (4) breaks the most recent minor swing. All four = strong departure.'),
            ('Common mistakes', 'Holding the trade through weak departure "to give it room"; treating a single large wick in the reaction direction as departure (it must be a body close); exiting on the first sign of pause instead of waiting for actual weak departure.'),
            ('Failure conditions', 'Departure fails when price returns to the zone and breaks the distal line. At that point the zone is consumed and the trade is invalid. The professional exits at the distal line break — never wider.'),
            ('Relationship to other concepts', 'Departure is the confirmation of Reaction; Departure is the engine of FTR; Departure creates the next BOS; Departure strength is a primary input to Zone Quality for the next zone created.'),
            ('Probability contribution', 'Strong departure on first candle: trade held to target with high hit rate. Weak departure: exit immediately; expected value is negative.'),
            ('Real chart example', 'GBPUSD H1 demand at 1.2680-1.2700. Price touches 1.2685 and the next H1 candle opens 1.2690, closes 1.2725, body 85%, breaks the prior minor swing at 1.2715. Strong departure — the zone is confirmed; hold the trade to the next supply. If instead the next candle had closed at 1.2695 with large wicks, the departure would be weak and the trade should be exited.'),
        ]),
        ('Reaction', [
            ('Definition', 'The price behaviour on contact with a zone. A clean rejection (impulsive move away from the zone in the expected direction) is high-probability; a slow grind through the zone is low-probability; a sweep (quick penetration followed by reversal) is a reversal setup.'),
            ('Purpose', 'Reaction is the validation of the zone. Without a reaction, the zone is just a price band; with a reaction, the zone is confirmed institutional inventory. The professional classifies the reaction type to decide whether to enter, wait, or invert the trade.'),
            ('Context', 'Reaction is assessed on the candle that touches the zone and the 1-3 candles immediately after. The reaction type determines the entry tactics: clean rejection = entry on the close; sweep = entry on the retest of the zone edge; grind = no entry.'),
            ('Why it forms', 'Reaction forms because the unfilled institutional inventory is being matched. Clean rejection = strong institutional dominance; sweep = institution grabbed liquidity beyond the zone then reversed; grind = no institutional dominance, opposing flow is matching evenly.'),
            ('How professionals identify it', 'Three reaction types: (1) Clean rejection — candle touches zone and closes back inside with a long wick, next candle departs impulsive in reaction direction. (2) Sweep — candle penetrates beyond the zone, grabs liquidity, then closes back inside with a long wick. (3) Grind — candle enters the zone and slowly traverses it without decisive close back outside.'),
            ('Common mistakes', 'Entering on the touch without waiting for the reaction type to reveal itself; treating a grind as a slow rejection; treating a sweep as a zone failure (a sweep is a high-probability reversal signal, not a failure).'),
            ('Failure conditions', 'Reaction fails when price closes decisively beyond the distal line of the zone. The reaction type no longer matters — the zone is consumed.'),
            ('Relationship to other concepts', 'Reaction is the visible output of the zone\'s institutional inventory; Reaction type determines entry tactics; Reaction strength determines trade management; Reaction is amplified by Decision Points and Nested Zones.'),
            ('Probability contribution', 'Clean rejection at a fresh zone: ~70%. Sweep + reversal at a fresh zone: ~75% (highest-probability setup in zone trading). Grind through: ~30% (treat as zone failure).'),
            ('Real chart example', 'EURUSD H1 supply at 1.0940-1.0960. Price touches 1.0945, the candle wicks up to 1.0955 and closes at 1.0942 with a long upper wick. Next candle opens 1.0942 and closes 1.0915, body 90%. This is a clean rejection — enter short on the close of the second candle, stop above 1.0960, target at the next demand.'),
        ]),
    ]

    for name, fields in entries:
        out.extend(_concept_entry(name, fields))

    out.append(P('<b>6.2  Zone Quality Scoring — the five dimensions</b>', H2))
    out.append(P(
        'The professional evaluates every zone on five dimensions, each '
        'scored 0-2, for a total of 0-10. The dimensions are not equally '
        'weighted in practice — curve alignment is the most important, '
        'followed by freshness — but the simple sum is a usable '
        'first-order approximation. The future engine should implement '
        'this scoring explicitly and use it as the primary input to trade '
        'sizing.', B))
    out.append(S(1, 6))
    out.append(CL('Zone Quality — the five dimensions', [
        '<b>1. Freshness (0-2).</b> 2 = untouched since creation. 1 = one touch (lightly consumed). 0 = two or more touches (consumed). The single most important dimension; freshness decay is non-linear.',
        '<b>2. Departure strength (0-2).</b> 2 = impulsive departure with BOS. 1 = impulsive departure without BOS. 0 = weak departure (small body, no structure break).',
        '<b>3. Curve alignment (0-2).</b> 2 = aligned with HTF curve. 1 = neutral (curve unclear or zone in range). 0 = counter-curve. The highest-impact dimension by expected value.',
        '<b>4. Nested confluence (0-2).</b> 2 = nested inside HTF zone. 1 = adjacent to HTF zone. 0 = standalone.',
        '<b>5. Positional strength (0-2).</b> 2 = at a major HTF swing. 1 = at a minor LTF swing. 0 = no significant swing.',
        '<b>Total: 0-10.</b> 7-10 = high quality (full size, no confirmation needed). 4-6 = medium quality (reduced size or require engulf/compression confirmation). 0-3 = low quality (skip).',
    ]))
    return out


def ch7_patterns(h):
    """Chapter 7 — Pattern Concepts."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    _concept_entry = h['_concept_entry']

    out.append(P(
        '<i>Patterns are the visible signatures of institutional events. An '
        'engulf is not a candle shape — it is the footprint of '
        'institutional commitment after a liquidity event.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>7.1  The pattern cluster</b>', H2))
    out.append(P(
        'Patterns are the third foundational cluster in RTM. Where '
        'structure defines direction and zones define location, patterns '
        'define <i>when</i> — the moment the institutional event becomes '
        'visible enough to act on. This chapter covers eight pattern '
        'concepts: Compression, Engulf, Failure To Return, Flag, Flag '
        'Limit, Continuation Pattern, Reversal Pattern, and Decision '
        'Candle. Chapter 8 covers the advanced patterns (QM, Diamond, MPL, '
        'BSZ).', B))

    entries = [
        ('Compression', [
            ('Definition', 'A tight consolidation of overlapping candles with diminishing range. Compression is the visible footprint of institutional accumulation/distribution in progress — opposing forces are absorbing each other while the institution builds position.'),
            ('Purpose', 'Compression is a forward-looking signal: the longer and tighter the compression, the more violent the eventual resolve. The professional does not trade inside compression; they prepare to trade the breakout.'),
            ('Context', 'Forms at the end of a move (reversal compression) or mid-trend (continuation compression). Reversal compressions form at zones; continuation compressions form at flags.'),
            ('Why it forms', 'Compression forms when an institution is absorbing opposing flow without showing its hand. As the institution\'s accumulation/distribution progresses, the available opposing flow diminishes, ranges contract, and the compression tightens. The eventual resolve is violent because there is no opposing flow left to absorb the institutional aggression.'),
            ('How professionals identify it', 'Three signs: (1) overlapping candle ranges (each candle\'s range mostly inside the previous), (2) diminishing ATR (each candle\'s range smaller than the prior), (3) at least 4-6 candles in the pattern. The longer the compression, the higher the probability of a strong resolve.'),
            ('Common mistakes', 'Treating any small-candle pause as compression (need 4+ candles with diminishing range); trading inside the compression (wait for the resolve); assuming compression always breaks in the trend direction (reversal compressions break against the trend).'),
            ('Failure conditions', 'Compression fails when it extends too long without resolving — typically >20 candles. At that point the institutional intent has likely changed; the compression is no longer accumulation but equilibrium. The setup is dead.'),
            ('Relationship to other concepts', 'Compression precedes Engulf (the resolve is often an engulf); Compression often forms inside a Base (a base is a 1-6 candle compression); Compression at a Flag Limit is a high-probability continuation setup; Compression at a zone is a high-probability reversal setup.'),
            ('Probability contribution', 'Compression resolve + curve alignment: ~70%. Compression resolve against curve: ~40%. Compression length is positively correlated with resolve strength.'),
            ('Real chart example', 'EURUSD H1: after a strong up-move to 1.0950, price compresses in a 6-candle range 1.0935-1.0950, each candle smaller than the last. The compression is at a known supply zone. When price breaks below 1.0935 with an engulf, the resolve is violent — price drops to 1.0880 in 4 candles. The compression was distribution at supply; the resolve confirmed it.'),
        ]),
        ('Engulf', [
            ('Definition', 'A candle whose body fully covers the prior candle\'s body in the opposite direction. The engulf is the visible signature of institutional commitment after an event — typically a liquidity sweep, a zone touch, or a compression resolve.'),
            ('Purpose', 'The engulf is the entry trigger. The professional does not enter on a zone touch — they enter on the engulf that confirms the zone reaction. Without an engulf, the reaction is unconfirmed; with an engulf, the institutional commitment is visible.'),
            ('Context', 'Engulfs form at zone reactions, at compression resolves, at flag limits, at sweep reversals. The location determines the engulf\'s significance: an engulf at a decision point is high-probability; an engulf in no-man\'s land is just a candle.'),
            ('Why it forms', 'An engulf forms when the institution becomes the dominant aggressor in the opposite direction of the prior candle. The prior candle\'s body represented one side\'s aggression; the engulf candle\'s body, by fully covering it, demonstrates that the opposing side has overwhelmed the first. The institutional commitment is now visible.'),
            ('How professionals identify it', 'Three checks: (1) prior candle has a clear body (not a doji), (2) engulf candle\'s body fully covers the prior candle\'s body in the opposite direction, (3) engulf candle closes near its extremum in the engulf direction. The stronger the engulf (larger body proportion, smaller wicks), the higher the probability.'),
            ('Common mistakes', 'Treating a candle that covers only the prior candle\'s range (including wicks) as an engulf (must cover the body); entering on every engulf regardless of location (location determines significance); ignoring the engulf\'s own body proportion (a weak engulf is not a confirmation).'),
            ('Failure conditions', 'An engulf fails when the next candle reclaims ≥50% of the engulf\'s range. The institutional commitment was fake — likely a liquidity event rather than a directional commitment. Exit immediately.'),
            ('Relationship to other concepts', 'Engulf is the resolve of Compression; Engulf is the entry trigger at Zone reactions; Engulf confirms Sweep reversals; Engulf is amplified at Decision Points; Engulf is the most common BOS candle.'),
            ('Probability contribution', 'Engulf at a fresh zone aligned with curve: ~72%. Engulf at a decision point: ~80%. Engulf in no-man\'s land: ~50% (do not trade).'),
            ('Real chart example', 'BTC H1: price touches a demand zone at 60000-60500, the prior candle is a small bearish candle (open 60800, close 60650). The next candle opens 60600, closes 61200, body fully covers the prior candle\'s body, close near high, breaks the prior minor swing at 61000. Bullish engulf at a fresh demand zone — enter long on the close, stop below 60000, target at the next supply.'),
        ]),
        ('Failure To Return (FTR)', [
            ('Definition', 'After a strong departure from a base, price fails to return to the base\'s origin. The FTR indicates no opposing interest — the institution that drove the departure is unopposed, and the move is likely to continue. The base is now confirmed as a high-quality zone.'),
            ('Purpose', 'FTR is the probability amplifier. A zone with FTR is significantly more likely to react on the next return than a zone without. The professional ranks FTR-confirmed zones above non-FTR zones, all else equal.'),
            ('Context', 'FTR is assessed on the price action immediately after the departure. If price departs and never returns to the base\'s distal line, FTR is established. The longer the non-return, the stronger the FTR.'),
            ('Why it forms', 'FTR forms because the institutional departure exhausted all opposing liquidity at the base. With no opposing interest, price has no reason to return. When the institution eventually pauses or reverses, the next likely reaction point is the base — because that is where the institutional inventory still rests.'),
            ('How professionals identify it', 'After a base + impulsive departure, check whether price has returned to the base\'s distal line. If not, FTR is established. The FTR is "strong" if price has not even reached the 38% retracement of the departure; "moderate" if it has reached 38-50%; "weak" if it has reached 50-62%. Beyond 62%, the FTR is broken.'),
            ('Common mistakes', 'Treating any non-return as FTR (need a strong departure first); ignoring the depth of the eventual return (a deep return breaks the FTR); treating FTR as permanent (FTR can be broken by curve shift or re-accumulation).'),
            ('Failure conditions', 'FTR fails when price returns and breaks the base\'s distal line. At that point the institutional intent has changed — either the institution has finished its position and is now reversing, or the opposing side has re-accumulated. The FTR-confirmed zone is no longer high-quality.'),
            ('Relationship to other concepts', 'FTR amplifies Zone Quality; FTR is created by strong Departure; FTR is preserved by Curve alignment; FTR is broken by CHoCH on a higher timeframe; FTR is the most reliable confirmation that a base is a real zone.'),
            ('Probability contribution', 'Strong FTR (no return): +15% over base rate. Moderate FTR (38-50% retracement): +8%. Weak FTR (50-62%): +3%. Broken FTR (>62%): -10% (zone is suspect).'),
            ('Real chart example', 'GBPUSD H4: base at 1.2600-1.2630, departure fires price to 1.2780 in 3 candles. Price retraces to 1.2700 (38% retracement) and resumes up. The base is now FTR-confirmed — the next time price reaches 1.2630, the reaction probability is significantly higher than without the FTR.'),
        ]),
        ('Flag', [
            ('Definition', 'A short counter-trend consolidation after an impulse. The flag is a continuation pattern, not a reversal — it pauses the trend before resuming it. The flag\'s boundary in the trend direction is the Flag Limit (FL), a high-probability reaction level.'),
            ('Purpose', 'Flags provide the second entry in a trend — the first was the impulse origin, the second is the flag limit. The professional enters at the FL when price reacts, with stop beyond the flag and target at the next structure.'),
            ('Context', 'Forms after an impulse, before the next impulse. The flag is typically 3-8 candles; longer consolidations are compressions or ranges, not flags.'),
            ('Why it forms', 'The flag forms as profit-taking and counter-trend participants create a temporary counter-flow. The institution that drove the impulse is absorbing this counter-flow without allowing structure to break; once absorbed, the next impulse fires.'),
            ('How professionals identify it', 'Three signs: (1) preceded by a clear impulse, (2) shallow retracement (typically 38-50% of the impulse), (3) overlapping candle ranges forming a tight range. The FL is the deepest point of the flag (in the trend direction).'),
            ('Common mistakes', 'Treating any pullback as a flag (need a clear impulse first); entering at the wrong end of the flag (the FL is the trend-direction extreme, not the counter-trend extreme); treating deep retracements (>62%) as flags (those are likely reversals).'),
            ('Failure conditions', 'A flag fails when price breaks the FL decisively. At that point the trend is in question — the "flag" was the first leg of a reversal. The professional exits and waits for structure to clarify.'),
            ('Relationship to other concepts', 'Flag is a Continuation Pattern; Flag Limit is the reaction level inside the Flag; Flag + Compression = high-probability continuation; Flag failure = early reversal signal; Flag is confirmed by the next impulse off the FL.'),
            ('Probability contribution', 'Flag at FL with curve alignment: ~65%. Flag with compression at the FL: ~72%. Flag without impulse confirmation: ~45%.'),
            ('Real chart example', 'ES H1: impulse from 4500 to 4540. Price pulls back in 5 overlapping candles to 4524 (40% retracement), holds, and resumes up. The 4524 level is the FL. Next time price reaches 4524 (in a future pullback), it is a high-probability long.'),
        ]),
        ('Flag Limit (FL)', [
            ('Definition', 'The boundary of a flag beyond which the prior impulse\'s intent is invalidated. The FL is the deepest point of the flag in the trend direction and a high-probability reaction level for future price action.'),
            ('Purpose', 'FLs are gravity wells. Once an FL forms, price tends to react there on future approaches — even weeks or months later. The professional marks every significant FL on every timeframe and treats them as priority reaction levels.'),
            ('Context', 'FLs form at the end of flags. The FL is the wick or body extreme of the deepest candle in the flag (in the trend direction). An FL is significant on the timeframe it formed; HTF FLs dominate LTF FLs.'),
            ('Why it forms', 'The FL is the price where the institutional absorption was strongest during the flag. That level retains institutional memory — orders rest there, and the level becomes a magnet for future price action.'),
            ('How professionals identify it', 'After an impulse + flag, identify the deepest point of the flag in the trend direction. That price is the FL. Mark it on the chart and monitor for reactions on future approaches.'),
            ('Common mistakes', 'Marking every minor pullback low as an FL (only significant flags produce significant FLs); ignoring the FL after the flag has been broken (broken FLs still have residual reaction probability); treating FLs as standalone zones (FLs are reaction levels, not zones — combine with a zone for entry).'),
            ('Failure conditions', 'An FL fails when price decisively breaks it AND closes beyond. At that point the flag\'s continuation intent is invalid. The FL retains some residual reaction probability but is no longer a primary level.'),
            ('Relationship to other concepts', 'FL is the reaction level inside a Flag; FL + Zone = high-probability entry; FL is a component of Decision Points; HTF FLs override LTF FLs; FL failure is an early reversal signal.'),
            ('Probability contribution', 'FL alone: ~55%. FL + Zone convergence: ~72%. FL + Zone + Curve alignment: ~78%. FLs are among the highest-probability standalone reaction levels in RTM.'),
            ('Real chart example', 'EURUSD H4: impulse from 1.0800 to 1.0940, flag to 1.0870 (FL at 1.0870), resume up. Three weeks later, price retraces to 1.0870 and bounces. The FL acted as a magnet even after the original flag was completed.'),
        ]),
        ('Continuation Pattern', [
            ('Definition', 'A structure that pauses the trend before resuming it. Continuation patterns include flags, compressions, shallow pullbacks, and inside-bar clusters. They are the institutional pause that precedes the next impulse.'),
            ('Purpose', 'Continuation patterns are the second-entry locations in a trend. The professional identifies them, marks their reaction level, and waits for the entry trigger. The first entry was the impulse origin; the continuation pattern is the second; the third is rare and lower quality.'),
            ('Context', 'Forms mid-trend, between impulses. The continuation pattern is the institutional absorption phase; the next impulse is the institutional aggression phase.'),
            ('Why it forms', 'Continuation patterns form because institutions cannot push price indefinitely without pause. Profit-taking, counter-trend participants, and the need to absorb new liquidity all require pauses. The pattern is the visible footprint of the pause.'),
            ('How professionals identify it', 'A continuation pattern is any structure that pauses the trend without breaking the trend\'s defining swing. The pattern must be shallow (≤62% retracement of the prior impulse), compact (overlapping candles), and resolve in the trend direction.'),
            ('Common mistakes', 'Treating deep retracements as continuation patterns (deep = reversal risk); entering before the resolve (wait for the engulf or BOS); treating a continuation pattern that breaks the trend swing as still valid (it is now a reversal).'),
            ('Failure conditions', 'A continuation pattern fails when price breaks the trend\'s defining swing. At that point the pattern is no longer continuation — it is the first leg of a reversal. The professional re-evaluates structure.'),
            ('Relationship to other concepts', 'Continuation Pattern includes Flag and Compression; Continuation Pattern is confirmed by the next impulse; Continuation Pattern failure = early CHoCH; Continuation Pattern at an FL is the highest-probability second entry.'),
            ('Probability contribution', 'Continuation at FL with curve alignment: ~70%. Continuation at consumed zone: ~45%. Continuation after deep retracement: ~40%.'),
            ('Real chart example', 'NAS100 H1: uptrend, impulse from 15600 to 15700, shallow flag to 15640 (38% retracement), engulf back up. The flag is a continuation pattern; the FL at 15640 is a high-probability long level. Entering on the engulf close at 15670 with stop below 15640 is the textbook continuation entry.'),
        ]),
        ('Reversal Pattern', [
            ('Definition', 'A structure that ends the trend. Reversal patterns include QM, Diamond, deep CHoCH after liquidity sweep, and failed continuation patterns. They mark the moment institutional intent shifts.'),
            ('Purpose', 'Reversal patterns are the highest-reward setups in RTM because they catch the start of a new trend. They are also the lowest-hit-rate setups — most apparent reversals are flags in disguise. The professional requires multiple confirmations before trading a reversal.'),
            ('Context', 'Forms at the end of an extended trend, typically after a liquidity sweep. The sweep provides the fuel; the reversal pattern is the structural confirmation.'),
            ('Why it forms', 'A reversal pattern forms because the institution that was driving the trend has finished its position. It distributes (in an uptrend reversal) or accumulates (in a downtrend reversal) into the latecomers, then reverses direction. The pattern is the visible footprint of the intent shift.'),
            ('How professionals identify it', 'Four confirmations required: (1) prior trend was extended (multiple impulses), (2) liquidity sweep at the end (stops beyond the obvious swing), (3) CHoCH on the reaction timeframe, (4) BOS in the new direction within 1-3 candles of the CHoCH. Without all four, do not trade the reversal.'),
            ('Common mistakes', 'Treating every counter-trend move as a reversal (most are continuations); entering on the CHoCH without waiting for BOS; ignoring the higher-timeframe curve (an H1 reversal against the H4 trend is low-probability); trading reversals without a sweep (the sweep is the institutional tell).'),
            ('Failure conditions', 'A reversal pattern fails when price reclaims the sweep extreme and resumes the prior trend. The apparent reversal was a fake — likely a deeper liquidity grab. Exit immediately; do not "give it room".'),
            ('Relationship to other concepts', 'Reversal Pattern includes QM and Diamond; Reversal Pattern requires a Sweep; Reversal Pattern is confirmed by CHoCH + BOS; Reversal Pattern against HTF curve = low probability; Reversal Pattern with HTF curve = highest-reward setup.'),
            ('Probability contribution', 'Reversal with sweep + CHoCH + BOS + HTF alignment: ~70%. Reversal missing any one confirmation: ~45%. Reversal against HTF curve: ~30%.'),
            ('Real chart example', 'EURUSD H1: extended uptrend, price sweeps prior HH at 1.0940 (buy-side liquidity), reverses sharply with an engulf, closes below the prior HL at 1.0920 (CHoCH), and within 2 candles closes below 1.0900 (BOS). H4 curve is bearish (LH/LL). This is a confirmed reversal — enter short on the BOS close, stop above 1.0940, target at the next H1 demand.'),
        ]),
        ('Decision Candle', [
            ('Definition', 'The candle at a zone whose close direction confirms or denies the zone\'s reaction. The decision candle is the entry trigger candle — the professional waits for its close before committing.'),
            ('Purpose', 'The decision candle is the operational trigger. Without a decision candle, the zone reaction is unconfirmed; with a decision candle that closes in the reaction direction, the trade is on. A decision candle that closes against the reaction invalidates the zone.'),
            ('Context', 'The decision candle is the first candle to close after the zone touch. Its close direction, body proportion, and close position determine whether the entry is taken.'),
            ('Why it forms', 'The decision candle is the candle on which the institutional inventory is being filled. If the institution is dominant, the candle closes in the reaction direction with strength. If not, the candle closes against the reaction — the zone is failing.'),
            ('How professionals identify it', 'Three checks on the decision candle: (1) close direction = reaction direction, (2) body proportion ≥60%, (3) close in the top/bottom 30% of the range (in the reaction direction). All three = valid decision candle, enter on the close.'),
            ('Common mistakes', 'Entering on the touch before the decision candle closes; treating a doji as a decision candle (it is not — wait for the next candle); entering when the decision candle is strong but against an HTF zone (curve context still applies).'),
            ('Failure conditions', 'The decision candle fails when it closes against the reaction direction with strength. At that point the zone reaction is invalid; the zone is being consumed. Do not enter; consider the inverse setup.'),
            ('Relationship to other concepts', 'Decision Candle is the operational form of Engulf at a zone; Decision Candle confirms Reaction; Decision Candle is the entry trigger for all zone trades; Decision Candle at a Decision Point is the highest-probability entry.'),
            ('Probability contribution', 'Decision candle at a fresh zone + curve alignment: ~72%. Decision candle at a decision point: ~80%. Weak decision candle (small body, mid-range close): ~50% (skip).'),
            ('Real chart example', 'GBPUSD H1 demand at 1.2680-1.2700. Price touches 1.2685; the H1 candle opens 1.2690, low 1.2682, close 1.2720, body 75%, close in top 25% of range. Valid decision candle — enter long on the close. Stop below 1.2680; target at the next supply.'),
        ]),
    ]

    for name, fields in entries:
        out.extend(_concept_entry(name, fields))

    out.append(P('<b>7.2  Pattern failure modes — preview</b>', H2))
    out.append(P(
        'Every pattern in this chapter has a failure mode. Engulfs fail '
        'when the next candle reclaims ≥50% of the engulf range. FTRs '
        'fail when price returns and breaks the base. Flags fail when '
        'price breaks the FL. Compressions fail when they extend beyond '
        '~20 candles. The full failure catalog is in Chapter 12; the key '
        'takeaway here is that <i>every pattern carries its own '
        'invalidation condition, and the invalidation is part of the '
        'pattern definition, not an afterthought</i>. A pattern without '
        'an invalidation condition is not a pattern — it is a hope.', B))
    return out


def ch8_advanced_patterns(h):
    """Chapter 8 — Advanced Pattern Concepts: QM, Diamond, MPL, BSZ."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    _concept_entry = h['_concept_entry']
    mono_block = h['mono_block']

    out.append(P(
        '<i>Advanced patterns are composite structures — they combine '
        'multiple basic patterns into a single high-probability setup. '
        'Mastery of these is what separates the professional from the '
        'pattern-mechanic.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>8.1  The advanced pattern cluster</b>', H2))
    out.append(P(
        'Advanced patterns are composite: each combines a liquidity '
        'event, a structural shift, and a return to a defined level. '
        'They are higher-probability than basic patterns because they '
        'require multiple institutional events to align — but they are '
        'also rarer and more easily misidentified. This chapter covers '
        'four: Quasimodo (QM), Diamond, MPL, and BSZ. The chapter '
        'closes with a decision callout on when to use which.', B))

    entries = [
        ('Quasimodo (QM)', [
            ('Definition', 'A reversal structure with five components: left shoulder, lower high (in a bearish QM) or higher low (in a bullish QM), head, BOS, return to the shoulder level, and entry. QM is the visible footprint of a liquidity sweep followed by an intent shift.'),
            ('Purpose', 'QM is one of the highest-probability reversal setups in RTM. It captures the exact moment the IPDA finishes a liquidity sweep and reverses direction. The entry is precisely defined (the shoulder level on the return), with a tight invalidation (beyond the head) and a high reward-to-risk (the full reversal).'),
            ('Context', 'Forms at the end of an extended trend, after a liquidity sweep. The QM is a top (bearish QM) or bottom (bullish QM) structure. Timeframe: QMs are valid on all timeframes but only tradeable when aligned with the HTF curve.'),
            ('Why it forms', 'The QM forms because the IPDA sweeps liquidity beyond the obvious swing (the head), then reverses. The shoulder is the prior swing that the sweep violated; the return to the shoulder is the IPDA re-entering its reversal direction. The BOS between the head and the shoulder confirms the intent shift.'),
            ('How professionals identify it', 'Five components in sequence: (1) prior trend, (2) left shoulder = first swing extreme, (3) head = new extreme beyond the shoulder (the sweep), (4) BOS = price breaks the most recent counter-trend swing (CHoCH), (5) return to the shoulder level on the retracement. Enter on the reaction at the shoulder.'),
            ('Common mistakes', 'Marking a QM without a clear sweep (the head must be a sweep, not just a new extreme); entering before the BOS (the BOS is required); treating the head itself as the entry (the entry is at the shoulder return, not the head); ignoring the HTF curve (counter-curve QMs have low probability).'),
            ('Failure conditions', 'A QM fails when price returns to the shoulder level and breaks it (instead of reacting). At that point the intent shift was fake — the IPDA was not actually reversing. Exit at the shoulder break; the QM is invalid.'),
            ('Relationship to other concepts', 'QM is a Reversal Pattern; QM requires a Sweep at the head; QM is confirmed by CHoCH (the BOS); QM entry is at the shoulder = a prior Swing; QM is amplified by Curve alignment and Nested Zones at the shoulder.'),
            ('Probability contribution', 'QM with sweep + CHoCH + curve alignment: ~75%. QM at a Decision Point (shoulder = HTF zone): ~82%. QM against HTF curve: ~35% — skip.'),
            ('Real chart example', 'See schematic below.'),
        ]),
        ('Diamond', [
            ('Definition', 'A symmetric reversal structure: an impulse, a shallow counter-move (the diamond — symmetric consolidation), then a continuation in the impulse direction that fails and reverses. The diamond is the visible footprint of distribution (or accumulation) under the appearance of continuation.'),
            ('Purpose', 'Diamond is a high-probability reversal setup, rarer than QM but often cleaner. The diamond\'s symmetry is the tell — institutional distribution that mimics continuation, luring latecomers in before reversing.'),
            ('Context', 'Forms at the end of an extended trend. The diamond itself is typically 5-10 candles of symmetric consolidation after an impulse. The reversal occurs when price breaks the diamond in the opposite direction of the impulse.'),
            ('Why it forms', 'The diamond forms because the institution distributes (in an uptrend) or accumulates (in a downtrend) into the latecomers chasing the impulse. The symmetric consolidation is the institutional absorption; the reversal is the institutional commitment.'),
            ('How professionals identify it', 'Three components: (1) extended prior trend, (2) impulse in the trend direction, (3) symmetric consolidation (the diamond) of 5-10 candles, (4) break of the diamond in the opposite direction of the impulse with strength. Enter on the diamond break, stop beyond the diamond\'s trend-direction extreme.'),
            ('Common mistakes', 'Treating any consolidation as a diamond (need symmetry); entering before the diamond break (wait for the resolve); ignoring the prior trend (diamonds without extended prior trend are just ranges); treating diamond breakouts in the trend direction as continuation (the diamond is a reversal pattern — the trend-direction break is a trap).'),
            ('Failure conditions', 'A Diamond fails when price breaks the diamond in the trend direction with strength and continues. The apparent distribution was real continuation; the diamond was a flag. Exit on the trend-direction break; the diamond is invalid.'),
            ('Relationship to other concepts', 'Diamond is a Reversal Pattern; Diamond is similar to Compression but with symmetry; Diamond is confirmed by BOS in the reversal direction; Diamond is amplified by Curve alignment and prior liquidity sweep.'),
            ('Probability contribution', 'Diamond with curve alignment + sweep prior: ~72%. Diamond without HTF confirmation: ~50%. Diamond failure (trend-direction break): treat as continuation.'),
            ('Real chart example', 'EURUSD H4: extended uptrend to 1.1100, impulse from 1.1050 to 1.1100, then 7 candles of symmetric consolidation 1.1075-1.1100 (the diamond), then a strong break below 1.1075 with an engulf. H4 curve is bearish. Diamond reversal confirmed — enter short on the break close, stop above 1.1100, target at the next H4 demand.'),
        ]),
        ('MPL — Maximum Pain Line / Most Probable Line', [
            ('Definition', 'The price level where the most resting orders sit, typically a prior swing high or low that has not yet been swept. The MPL is the IPDA\'s most likely target when it needs liquidity. Two community usages: (a) Maximum Pain Line — the level that would cause the most pain to the most participants if hit (i.e., the level that triggers the most stops); (b) Most Probable Line — the most probable next reaction level based on structural convergence. Both meanings often describe the same level.'),
            ('Purpose', 'The MPL is a target, not an entry. The professional identifies the MPL on the HTF and uses it as the take-profit for trades in the direction of the MPL. When the IPDA reaches the MPL, it is likely to sweep it and reverse.'),
            ('Context', 'The MPL is typically a major HTF swing that has not been swept. The longer unswept, the more significant. MPLs on Weekly or Daily timeframes dominate LTF MPLs.'),
            ('Why it forms', 'The MPL forms because unswept major swings accumulate stops over time. As price moves away and retail traders enter the trend, stops cluster just beyond the unswept swing. When the IPDA needs liquidity (to fill a large order in the opposite direction), it targets the MPL.'),
            ('How professionals identify it', 'On the HTF, identify major swings that have NOT been swept since formation. The most significant unswept swing (oldest + most obvious) is the MPL. Mark it as a target for trades in its direction.'),
            ('Common mistakes', 'Treating every swing as an MPL (only major HTF swings qualify); treating the MPL as an entry level (it is a target, not an entry — entries are at zones, not at MPLs); ignoring the MPL after it has been swept (a swept MPL is no longer an MPL; find the next one).'),
            ('Failure conditions', 'An MPL is "consumed" when it is swept. After the sweep, the level may still react but with much lower probability. The professional re-identifies the next MPL after a sweep.'),
            ('Relationship to other concepts', 'MPL is a Liquidity concept (it is a Liquidity Pool on the HTF); MPL is the target for trades in its direction; MPL is often the head of a QM (the sweep of the MPL is the QM head); MPL + Zone + Curve = full RTM trade plan (entry at zone, target at MPL, direction by curve).'),
            ('Probability contribution', 'MPL as target: ~70% hit rate (the IPDA tends to reach MPLs). MPL as entry (after sweep + reversal): ~65% (sweep of MPL is a high-probability reversal setup).'),
            ('Real chart example', 'EURUSD Weekly: prior swing high at 1.1275 from 8 months ago, unswept since. This is the MPL. Daily curve is bullish. On H1, a fresh demand zone at 1.0900 is the entry. The trade plan: long at 1.0900, target at 1.1275 (the MPL). When price reaches 1.1275, expect a sweep and potential reversal — exit before the sweep, do not chase.'),
        ]),
        ('BSZ — Base & Solid Zone / Buy-Side Zone', [
            ('Definition', 'A community term with two usages: (a) Base & Solid Zone — a zone that has been confirmed by multiple reactions and is treated as a high-quality reference; (b) Buy-Side Zone — a zone above the current price where buy-side liquidity (buy stops) rests. The two meanings are distinct: the first is a quality designation, the second is a liquidity designation. Both can apply to the same level.'),
            ('Purpose', 'In the "Base & Solid Zone" sense, BSZ is a quality filter — the professional treats BSZ-confirmed zones as priority reaction levels. In the "Buy-Side Zone" sense, BSZ is a target — the IPDA is likely to visit a buy-side zone to fill buy stops before any bearish move.'),
            ('Context', 'BSZ (Base & Solid Zone) forms after a zone has reacted at least twice with strong departures. BSZ (Buy-Side Zone) is any level above the current price where buy stops rest — typically beyond prior swing highs.'),
            ('Why it forms', 'BSZ (Base & Solid Zone) forms because each reaction confirms the zone\'s institutional inventory. After 2-3 strong reactions, the zone is "solid" — its institutional underpinning is verified. BSZ (Buy-Side Zone) forms because buy stops cluster beyond obvious swing highs; the IPDA targets these clusters when it needs buy-side liquidity.'),
            ('How professionals identify it', 'BSZ (Base & Solid Zone): mark any zone that has reacted 2+ times with strong departures. Treat as priority. BSZ (Buy-Side Zone): mark any level above the current price where buy stops cluster (beyond prior swing highs). Treat as a target for bullish moves and a potential reversal location after sweep.'),
            ('Common mistakes', 'Confusing the two meanings (they are different concepts that share an abbreviation); treating a buy-side zone as a long entry (it is a target, not an entry); treating a base & solid zone as fresh (it has been touched, so it is consumed — the "solid" designation does not restore freshness).'),
            ('Failure conditions', 'BSZ (Base & Solid Zone) fails when price breaks the zone decisively — at that point the "solid" designation is revoked. BSZ (Buy-Side Zone) fails (as a reversal setup) when price sweeps the level and continues — the buy stops were filled but no reversal occurred.'),
            ('Relationship to other concepts', 'BSZ (Buy-Side Zone) is a Liquidity Pool; BSZ (Base & Solid Zone) is a quality designation for Zones; BSZ (Buy-Side Zone) + Sweep = QM head candidate; BSZ (Base & Solid Zone) is a component of Decision Points.'),
            ('Probability contribution', 'BSZ (Base & Solid Zone) as a reaction level: ~65% (despite consumption, the institutional underpinning holds). BSZ (Buy-Side Zone) as a target: ~70% (the IPDA tends to visit). BSZ (Buy-Side Zone) + Sweep + Reversal: ~68%.'),
            ('Real chart example', 'EURUSD H1: a supply zone at 1.0940-1.0960 has reacted 3 times with strong bearish departures over the past 4 weeks. This is a BSZ (Base & Solid Zone). On the next approach, treat as a priority short level — but require confirmation (engulf or compression break) because the zone is consumed. Separately, the prior H4 swing high at 1.1020 is unswept — this is a BSZ (Buy-Side Zone) and a likely target for any bullish move from current levels.'),
        ]),
    ]

    for name, fields in entries:
        out.extend(_concept_entry(name, fields))

    out.append(P('<b>8.2  QM schematic</b>', H2))
    out.append(P(
        'The QM is the most structurally precise reversal pattern in '
        'RTM. The schematic below shows a bearish QM (after an uptrend). '
        'A bullish QM is the mirror image.', B))
    out.append(S(1, 4))
    out.append(mono_block([
        'BEARISH QUASIMODO (after uptrend)',
        '',
        '  Price',
        '   ^',
        '   |              Head  ← sweep of buy-side liquidity',
        '   |                *',
        '   |               / \\',
        '   |   LH        /   \\        ← Left Shoulder line',
        '   |    *-------/     \\                                       ',
        '   |   / \\            \\      *  ← Return to shoulder',
        '   |  /   \\            \\    / \\       (entry here)',
        '   | /     \\            \\  /   \\',
        '   |/       \\            \\/     \\',
        '   |         \\            *      \\   ← BOS line (CHoCH)',
        '   |          \\                   \\',
        '   |           \\                   \\',
        '   |            *                   *   ← Lower low confirmed',
        '   |',
        '   +-----------------------------------------> Time',
        '',
        'Sequence:',
        '  1. Uptrend establishes Left Shoulder (prior swing high).',
        '  2. Pullback creates a Lower High (LH).',
        '  3. Final push creates the Head — sweeps above the Left Shoulder.',
        '  4. Sharp reversal breaks below the LH (BOS / CHoCH).',
        '  5. Retracement returns to the Left Shoulder line.',
        '  6. Reaction at the shoulder = entry (short).',
        '  7. Stop: above the Head. Target: next HTF demand.',
    ]))

    out.append(P('<b>8.3  When to use which advanced pattern</b>', H2))
    out.append(P(
        'The four advanced patterns are not interchangeable — each has a '
        'specific context in which it is the right tool. The decision '
        'callout below summarises when to use each.', B))
    out.append(S(1, 6))
    out.append(CL('Advanced pattern selection', [
        '<b>Use QM</b> when: extended prior trend + clear liquidity sweep at the head + CHoCH + return to a defined shoulder level. QM is the highest-probability reversal setup; default to QM when the structure allows.',
        '<b>Use Diamond</b> when: extended prior trend + impulse + symmetric consolidation + reversal break. Diamond is rarer than QM but cleaner; use when the consolidation symmetry is obvious.',
        '<b>Use MPL</b> as: the target for any trade in the direction of an unswept major HTF swing. MPL is not an entry pattern — it is a take-profit location. Always identify the MPL before entering; without a target, there is no trade.',
        '<b>Use BSZ (Base & Solid Zone)</b> as: a priority reaction level for confirmation-required trades. Use <b>BSZ (Buy-Side Zone)</b> as: a target for bullish moves and a potential reversal location after sweep.',
        '<b>Default rule</b>: when in doubt, do not trade the advanced pattern. These patterns require precision; a misidentified QM or Diamond is far worse than a missed setup. Wait for clarity.',
    ]))
    return out


def ch9_liquidity(h):
    """Chapter 9 — Liquidity Concepts."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    _concept_entry = h['_concept_entry']

    out.append(P(
        '<i>Liquidity is the fuel. Every move, every stop, every failure '
        'is a liquidity event. Without understanding liquidity, RTM '
        'becomes a pattern-matching exercise — and pattern-matching '
        'without liquidity is gambling.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>9.1  The liquidity cluster</b>', H2))
    out.append(P(
        'Liquidity is the fourth foundational cluster. It is also the '
        'least visible to retail traders and the most exploited by '
        'institutions. This chapter covers nine liquidity concepts: '
        'Liquidity, Liquidity Pools, Stop Hunt, IPDA Manipulation, '
        'Buy-Side Liquidity, Sell-Side Liquidity, Sweep, FTR (revisited '
        'as a liquidity concept), and Reaction (revisited as a liquidity '
        'outcome). The chapter closes with the Four Liquidity Laws — the '
        'axioms that govern liquidity-driven price action.', B))

    entries = [
        ('Liquidity', [
            ('Definition', 'Resting orders — stops and pending entries — clustered at predictable price levels. Liquidity is the fuel the IPDA seeks; without it, the IPDA cannot fill large orders efficiently.'),
            ('Purpose', 'Understanding liquidity transforms the chart from a curve into a map of resting orders. The professional sees not just where price has been, but where the orders are — and therefore where price is likely to go.'),
            ('Context', 'Liquidity clusters at obvious swing highs and lows, beyond round numbers, beyond trendline touches, and at known zone edges. The more obvious the level, the more liquidity sits there.'),
            ('Why it forms', 'Liquidity forms because retail traders are predictable. They place stops beyond obvious swings (because that\'s what textbooks teach), they place pending entries at round numbers (because that\'s easy), and they cluster their orders at zone edges (because that\'s where the textbook says to enter). The IPDA sees this and targets it.'),
            ('How professionals identify it', 'Identify obvious swing highs and lows on multiple timeframes. The more obvious (longer-lasting, more touches, more visible), the more liquidity beyond them. Mark these levels as liquidity pools.'),
            ('Common mistakes', 'Treating every swing as a liquidity pool (only obvious swings qualify); ignoring liquidity on lower timeframes (LTF liquidity is real, just smaller); assuming liquidity is permanent (liquidity is consumed when swept and re-forms over time).'),
            ('Failure conditions', 'Liquidity "fails" when it has been swept — the orders are gone, the level is no longer a target. The professional re-maps liquidity after every sweep.'),
            ('Relationship to other concepts', 'Liquidity is the fuel for every IPDA move; Liquidity Pools are the specific locations; Stop Hunts are the events of sweeping them; Sweeps that fail = high-probability reversals; Liquidity is the "why" behind QM heads, Diamond impulses, and flag-limit breaks.'),
            ('Probability contribution', 'Liquidity-aware trading adds ~10% to hit rate over liquidity-blind trading. Liquidity-blind entries at obvious levels are the #1 cause of retail losses.'),
            ('Real chart example', 'EURUSD H1: prior swing high at 1.0940, obvious, multiple touches. Retail stops sit at 1.0942-1.0945. Price pushes to 1.0948 (sweep), reverses sharply. The sweep was the IPDA filling buy stops; the reversal was the IPDA reversing direction now that it had liquidity.'),
        ]),
        ('Liquidity Pool', [
            ('Definition', 'A concentration of resting orders at a specific price level. Liquidity pools are the IPDA\'s targets — when the IPDA needs liquidity, it visits a pool.'),
            ('Purpose', 'Identifying liquidity pools allows the professional to predict the IPDA\'s next move. If the IPDA is building a short position, it will likely push price up to a buy-side liquidity pool to fill sell orders into the buy stops. The professional positions accordingly.'),
            ('Context', 'Liquidity pools form beyond obvious swing highs (buy-side) and below obvious swing lows (sell-side). The size of the pool scales with the obviousness of the swing and the time since it was last swept.'),
            ('Why it forms', 'A liquidity pool forms because retail stop-placement is predictable. Every retail long has a stop above; every retail short has a stop below. At obvious swings, these stops cluster — forming a pool.'),
            ('How professionals identify it', 'Identify the most obvious unswept swing highs (buy-side pools) and swing lows (sell-side pools) on the relevant timeframe. The more obvious (more touches, longer-lasting, more visible on HTF), the larger the pool.'),
            ('Common mistakes', 'Treating every swing as a pool (only obvious swings qualify); treating a swept pool as still active (swept pools are consumed); ignoring the time dimension (pools grow over time as more stops accumulate).'),
            ('Failure conditions', 'A liquidity pool is consumed when swept. After the sweep, the pool is empty until new stops accumulate — typically takes days to weeks on H1, weeks to months on Daily.'),
            ('Relationship to other concepts', 'Liquidity Pools are the specific locations of Liquidity; Stop Hunts are sweeps of Liquidity Pools; MPL is the highest-timeframe Liquidity Pool; Buy-Side Liquidity and Sell-Side Liquidity are the two types of pools; Sweeps are the events of visiting pools.'),
            ('Probability contribution', 'Trades targeting a liquidity pool: ~70% hit rate (the IPDA tends to visit pools). Reversals after a pool sweep: ~65% (sweeps that fail to continue are high-probability reversals).'),
            ('Real chart example', 'GBPUSD H1: obvious swing high at 1.2785 with 4 touches over 3 days. This is a buy-side liquidity pool. Price pushes to 1.2790 (sweep), immediately reverses. The pool was filled; price is now likely to seek the next pool (sell-side, below).'),
        ]),
        ('Stop Hunt', [
            ('Definition', 'A deliberate move beyond a swing to trigger stops, followed by immediate reversal. The stop hunt is the IPDA\'s most common manipulation — it gathers liquidity by triggering retail stops, then reverses to deliver the true directional move.'),
            ('Purpose', 'Recognising stop hunts allows the professional to avoid entering on the fake break (the hunt) and to enter on the reversal (the true move). Stop hunts are among the highest-probability reversal setups in RTM.'),
            ('Context', 'Stop hunts occur at obvious swing highs and lows. The hunt is typically 1-3 candles; the reversal that follows is often impulsive. Timeframe: stop hunts on H4 are more significant than on M15.'),
            ('Why it forms', 'The IPDA needs liquidity to fill large orders. The cheapest liquidity sits just beyond obvious swings (retail stops). The IPDA pushes price beyond the swing, triggers the stops (which become market orders in the IPDA\'s direction), fills its order against those stops, then reverses.'),
            ('How professionals identify it', 'Three signs: (1) obvious swing with prior liquidity pool, (2) quick move beyond the swing (often a single candle), (3) immediate reversal with strength. The wick beyond the swing is the visible signature of the hunt.'),
            ('Common mistakes', 'Treating every wick beyond a swing as a stop hunt (need obvious swing + immediate reversal); entering on the hunt itself (wait for the reversal); ignoring the HTF curve (stop hunts with HTF alignment are far higher-probability).'),
            ('Failure conditions', 'A stop hunt "fails" when price does not reverse — the sweep was real continuation, not a hunt. This is rare but occurs when the IPDA is genuinely continuing in the sweep direction. The professional exits on a close beyond the sweep extreme.'),
            ('Relationship to other concepts', 'Stop Hunt is the event of sweeping a Liquidity Pool; Stop Hunt is the head of a QM; Stop Hunt is the precursor to most Diamond reversals; Stop Hunt + CHoCH = high-probability reversal setup; Stop Hunt that fails to reverse = real continuation.'),
            ('Probability contribution', 'Stop hunt + immediate reversal + CHoCH + curve alignment: ~75%. Stop hunt alone (no CHoCH): ~50% (wait for confirmation). Stop hunt against HTF curve: ~35% — skip.'),
            ('Real chart example', 'EURUSD H1: obvious swing high at 1.0940 (buy-side liquidity). Price pushes a single H1 candle to 1.0948 (sweep), immediately reverses with an engulf, closes at 1.0915. This is a stop hunt + engulf reversal. Enter short on the engulf close, stop above 1.0948, target at the next sell-side liquidity pool.'),
        ]),
        ('IPDA Manipulation', [
            ('Definition', 'The pattern by which price engineers liquidity grabs before delivering the true directional move. Manipulation is the IPDA\'s defining behaviour — it is what makes RTM possible. Without manipulation, the chart would be random.'),
            ('Purpose', 'Understanding manipulation allows the professional to anticipate the true move. The manipulation phase is the fake move (the liquidity grab); the true move follows immediately after. The professional waits for the manipulation, then enters on the true move.'),
            ('Context', 'Manipulation occurs at every significant swing. The manipulation phase is typically 1-3 candles; the true move that follows is typically 5-15 candles. The manipulation is most pronounced at session opens and around news events.'),
            ('Why it forms', 'The IPDA manipulates because it must. Large orders cannot be filled at fair prices without liquidity; liquidity sits at obvious levels; therefore the IPDA must visit obvious levels to fill large orders. The visit IS the manipulation.'),
            ('How professionals identify it', 'Three phases: (1) accumulation/distribution (the institutional positioning — often invisible), (2) manipulation (the liquidity grab — visible as a sweep), (3) the true move (the deployment — visible as the post-sweep impulse). The professional identifies the manipulation phase and prepares to enter on the true move.'),
            ('Common mistakes', 'Treating every counter-trend move as manipulation (some are real reversals); entering during the manipulation phase (wait for the true move); ignoring the accumulation phase (manipulation without prior accumulation is just volatility).'),
            ('Failure conditions', 'Manipulation "fails" when there is no true move after the sweep — the sweep was real continuation, not manipulation. This is the same failure condition as the Stop Hunt; the two concepts overlap heavily.'),
            ('Relationship to other concepts', 'IPDA Manipulation is the meta-pattern that contains Stop Hunts, Sweeps, and QM heads; Manipulation is the cause of most Reversal Patterns; Manipulation is the reason Fresh Zones work (the IPDA visits fresh zones to fill remaining inventory); Manipulation is why obvious levels fail (they are manipulation targets).'),
            ('Probability contribution', 'Trading the true move after identified manipulation: ~72%. Trading the manipulation phase itself: ~30% (you are the liquidity).'),
            ('Real chart example', 'ES H1: at the London open, price pushes below the Asian session low at 4500 (sell-side liquidity grab — manipulation), then reverses sharply and rallies to 4540 (the true move). The professional who recognised the manipulation entered long on the reversal engulf; the retail trader who shorted the break of 4500 was stopped out.'),
        ]),
        ('Buy-Side Liquidity', [
            ('Definition', 'Resting buy stops above swing highs. Buy-side liquidity is the IPDA\'s target when it needs to fill sell orders (the buy stops become market buys that the IPDA can sell into).'),
            ('Purpose', 'Identifying buy-side liquidity allows the professional to predict where the IPDA will go to distribute. If the IPDA is building a short, it will push price up to buy-side liquidity to fill its sells. The professional positions short before the push, or waits to short the sweep.'),
            ('Context', 'Buy-side liquidity sits above obvious swing highs. The most significant buy-side liquidity is above HTF swing highs that have not been swept (the MPL).'),
            ('Why it forms', 'Buy-side liquidity forms because retail longs place stop-losses above their entries, and retail shorts place buy-stop entries above obvious swings. Both cluster above swing highs.'),
            ('How professionals identify it', 'Identify obvious swing highs on multiple timeframes. The more obvious and unswept, the more buy-side liquidity above. Mark these levels as buy-side liquidity targets.'),
            ('Common mistakes', 'Treating buy-side liquidity as long entry targets (it is the opposite — the IPDA visits buy-side liquidity to sell); ignoring the magnitude (HTF buy-side liquidity dominates LTF); forgetting that swept buy-side liquidity is consumed.'),
            ('Failure conditions', 'Buy-side liquidity is consumed when swept. After the sweep, no significant buy stops remain at that level until new ones accumulate.'),
            ('Relationship to other concepts', 'Buy-Side Liquidity is one of two Liquidity Pool types (the other is Sell-Side); Buy-Side Liquidity is the target of distribution; Buy-Side Liquidity + Sweep = potential QM head; MPL is the highest-timeframe Buy-Side Liquidity.'),
            ('Probability contribution', 'Price reaches buy-side liquidity before bearish moves: ~70%. After sweeping buy-side liquidity, bearish reversal probability: ~65% (if sweep + CHoCH).'),
            ('Real chart example', 'EURUSD H1: obvious swing highs at 1.0940 (H1) and 1.0980 (H4). Both are buy-side liquidity. Price pushes to 1.0948 (sweeps the H1 pool), reverses to 1.0910, then pushes to 1.0985 (sweeps the H4 pool), reverses to 1.0920. The IPDA visited both buy-side liquidity pools before delivering its bearish move.'),
        ]),
        ('Sell-Side Liquidity', [
            ('Definition', 'Resting sell stops below swing lows. Sell-side liquidity is the IPDA\'s target when it needs to fill buy orders (the sell stops become market sells that the IPDA can buy into).'),
            ('Purpose', 'Identifying sell-side liquidity allows the professional to predict where the IPDA will go to accumulate. If the IPDA is building a long, it will push price down to sell-side liquidity to fill its buys. The professional positions long before the push, or waits to long the sweep.'),
            ('Context', 'Sell-side liquidity sits below obvious swing lows. The most significant sell-side liquidity is below HTF swing lows that have not been swept.'),
            ('Why it forms', 'Sell-side liquidity forms because retail shorts place stop-losses below their entries, and retail longs place sell-stop entries below obvious swings. Both cluster below swing lows.'),
            ('How professionals identify it', 'Identify obvious swing lows on multiple timeframes. The more obvious and unswept, the more sell-side liquidity below. Mark these levels as sell-side liquidity targets.'),
            ('Common mistakes', 'Treating sell-side liquidity as short entry targets (it is the opposite — the IPDA visits sell-side liquidity to buy); ignoring the magnitude; forgetting that swept sell-side liquidity is consumed.'),
            ('Failure conditions', 'Sell-side liquidity is consumed when swept. After the sweep, no significant sell stops remain at that level until new ones accumulate.'),
            ('Relationship to other concepts', 'Sell-Side Liquidity is one of two Liquidity Pool types; Sell-Side Liquidity is the target of accumulation; Sell-Side Liquidity + Sweep = potential bullish QM head; MPL is the highest-timeframe Buy-Side or Sell-Side Liquidity depending on direction.'),
            ('Probability contribution', 'Price reaches sell-side liquidity before bullish moves: ~70%. After sweeping sell-side liquidity, bullish reversal probability: ~65% (if sweep + CHoCH).'),
            ('Real chart example', 'GBPUSD H1: obvious swing low at 1.2600 (Asian session low). At London open, price pushes to 1.2595 (sweeps sell-side liquidity), reverses sharply with an engulf, closes at 1.2640. The sweep was the IPDA filling buy orders into the sell stops; the reversal is the true bullish move. Enter long on the engulf close.'),
        ]),
        ('Sweep', [
            ('Definition', 'A quick move beyond a liquidity pool that immediately reverses. The sweep is the visible signature of a stop hunt or liquidity grab. Sweeps are the highest-probability reversal triggers in RTM.'),
            ('Purpose', 'Recognising a sweep allows the professional to enter on the reversal immediately, with tight invalidation (beyond the sweep extreme) and high reward (the full reversal). Sweeps are the bread-and-butter of professional RTM trading.'),
            ('Context', 'Sweeps occur at liquidity pools on every timeframe. The most significant sweeps are at HTF pools (Daily, Weekly). LTF sweeps (M1, M5) are smaller and less reliable.'),
            ('Why it forms', 'A sweep forms because the IPDA pushes price beyond a liquidity pool to fill orders against the stops, then immediately reverses to deliver the true move. The push is the sweep; the reversal is the deployment.'),
            ('How professionals identify it', 'Three signs: (1) obvious liquidity pool (swing high/low with prior obviousness), (2) quick move beyond the pool (often a single candle, wick beyond), (3) immediate reversal with strength (engulf or strong impulse in the opposite direction). All three = sweep.'),
            ('Common mistakes', 'Treating every wick beyond a swing as a sweep (need immediate reversal); entering before the reversal confirms (wait for the engulf or CHoCH); ignoring the HTF curve (counter-curve sweeps are low-probability).'),
            ('Failure conditions', 'A sweep fails when price does not reverse — the move beyond the pool was real continuation, not a sweep. The professional exits on a close beyond the sweep extreme; the sweep was fake.'),
            ('Relationship to other concepts', 'Sweep is the visible event of a Stop Hunt; Sweep is the head of a QM; Sweep + CHoCH = high-probability reversal; Sweep that fails = real continuation (treat as BOS); Sweeps at HTF pools are more significant than LTF sweeps.'),
            ('Probability contribution', 'Sweep + immediate reversal + CHoCH + curve alignment: ~75%. Sweep alone (no CHoCH): ~50% (wait). Counter-curve sweep: ~35% — skip.'),
            ('Real chart example', 'BTC H4: obvious swing high at 73000 (H4 pool). Price pushes a single H4 candle to 73500 (sweep), immediately reverses with a strong bearish engulf, closes at 70000. Sweep + engulf + (if H4 curve bearish) = high-probability short. Enter on the engulf close, stop above 73500, target at the next sell-side liquidity.'),
        ]),
        ('FTR (liquidity perspective)', [
            ('Definition', 'FTR reconsidered as a liquidity event. After a departure, the failure to return means no opposing liquidity was sufficient to push price back. The institution\'s departure exhausted all opposing liquidity; the base\'s unfilled inventory is the only remaining liquidity in the area.'),
            ('Purpose', 'FTR as a liquidity concept explains why FTR-confirmed zones are high-probability: they are the only remaining liquidity in the area. When price returns, the IPDA must interact with the zone because there is nowhere else to go for liquidity.'),
            ('Context', 'FTR is established immediately after a strong departure. The longer the non-return, the more thoroughly the opposing liquidity has been exhausted, and the more significant the FTR.'),
            ('Why it forms', 'FTR forms because the institutional departure filled all opposing liquidity at and beyond the base. With no opposing liquidity, price has no reason to return. The base\'s unfilled inventory is the only liquidity left in the area.'),
            ('How professionals identify it', 'Same as the pattern-cluster FTR: after a base + strong departure, check whether price has returned to the base. If not, FTR is established. From the liquidity perspective, the FTR is the proof that opposing liquidity was exhausted.'),
            ('Common mistakes', 'Same as pattern-cluster FTR. Additionally, from the liquidity perspective: forgetting that FTR can be broken if new opposing liquidity accumulates over time (a long non-return does not guarantee permanent FTR).'),
            ('Failure conditions', 'FTR fails when new opposing liquidity accumulates and pushes price back to the base. This typically requires a curve shift or a major news event.'),
            ('Relationship to other concepts', 'FTR is the liquidity perspective on the pattern-cluster FTR; FTR is created by strong Departure (which exhausts opposing liquidity); FTR is preserved when no new opposing liquidity forms; FTR is broken by Curve shift (which attracts new opposing liquidity).'),
            ('Probability contribution', 'FTR-confirmed zone reaction: +15% over base rate. FTR + curve alignment: +20%. FTR is one of the strongest single probability amplifiers in RTM.'),
            ('Real chart example', 'See FTR entry in Chapter 7. From the liquidity perspective: the strong departure from 1.2600-1.2630 to 1.2780 exhausted all sell-side liquidity in the 1.2600-1.2700 area. The base at 1.2600-1.2630 is now the only liquidity in that area; when price returns, it must interact with the base.'),
        ]),
        ('Reaction (liquidity perspective)', [
            ('Definition', 'Reaction reconsidered as a liquidity event. The zone reaction is the visible result of the IPDA filling the remaining inventory at the zone. The strength of the reaction is proportional to the size of the remaining inventory.'),
            ('Purpose', 'From the liquidity perspective, the reaction is not a "bounce" — it is the IPDA consuming liquidity. A strong reaction means large remaining inventory; a weak reaction means the inventory is mostly consumed.'),
            ('Context', 'Reactions occur at zone touches. The reaction strength indicates the remaining inventory; the reaction type (clean rejection, sweep, grind) indicates how the IPDA is filling the inventory.'),
            ('Why it forms', 'A reaction forms because the IPDA visits the zone to fill remaining inventory. The unfilled orders at the zone are matched against the IPDA\'s opposing orders, and price moves in the reaction direction.'),
            ('How professionals identify it', 'Same as the zone-cluster Reaction. From the liquidity perspective: assess the reaction strength as a proxy for remaining inventory. Strong reaction = fresh zone with full inventory. Weak reaction = consumed zone with depleted inventory.'),
            ('Common mistakes', 'Same as zone-cluster Reaction. Additionally: ignoring the inventory interpretation (a weak reaction at a fresh zone is a warning sign — the inventory may have been depleted without obvious touches, e.g., by dark-pool activity).'),
            ('Failure conditions', 'Same as zone-cluster Reaction.'),
            ('Relationship to other concepts', 'Reaction is the visible output of liquidity consumption at a Zone; Reaction strength proxies remaining inventory; Reaction type (clean/sweep/grind) reveals IPDA tactics; Reaction is amplified by Decision Points (multiple inventory sources).'),
            ('Probability contribution', 'Strong reaction at a fresh zone: confirms high remaining inventory — +10% to next-touch probability. Weak reaction at a fresh zone: warns of depleted inventory — -10%.'),
            ('Real chart example', 'EURUSD H1 demand at 1.0820-1.0840, fresh. Price touches 1.0830 and bounces 60 pips in 2 candles. Strong reaction — confirms high remaining inventory. Next time price approaches, the zone is still high-probability (inventory was confirmed). Compare: if the reaction had been 15 pips over 5 candles, the inventory would be suspect.'),
        ]),
    ]

    for name, fields in entries:
        out.extend(_concept_entry(name, fields))

    out.append(P('<b>9.2  The Four Liquidity Laws</b>', H2))
    out.append(P(
        'The liquidity cluster is governed by four laws. They are not '
        'derived from anything else; they are the axioms of liquidity. '
        'Every liquidity concept in this chapter is a consequence of '
        'these four laws, and every liquidity-driven trade must be '
        'consistent with all four.', B))
    out.append(S(1, 6))
    out.append(CL('The Four Liquidity Laws', [
        '<b>Law 1 — Price seeks liquidity.</b> The IPDA does not move randomly; it moves toward liquidity. If there is a significant unswept liquidity pool in one direction, price is biased to visit it. The professional asks: where is the nearest significant liquidity? That is the likely next target.',
        '<b>Law 2 — Liquidity sits beyond obvious swings.</b> Stops do not sit at random prices; they cluster just beyond obvious swing highs and lows. The more obvious the swing, the larger the cluster. The professional maps liquidity by mapping obvious swings.',
        '<b>Law 3 — Sweeps that fail to continue are reversals.</b> When price sweeps a liquidity pool and immediately reverses, the sweep was a stop hunt — the IPDA filled orders against the stops and is now reversing. Sweeps that fail are among the highest-probability reversal signals in RTM.',
        '<b>Law 4 — The IPDA never shows its hand except through departure.</b> The IPDA\'s accumulation and distribution are invisible; only the departure (the impulse after the position is built) is visible. The professional never assumes the IPDA\'s intent before the departure; they wait for the departure to reveal it.',
    ]))
    out.append(S(1, 6))
    out.append(P(
        'These four laws are the foundation of liquidity-driven trading. '
        'The future engine\'s reasoning module must check all four '
        'before issuing any signal: <i>where is the nearest liquidity? '
        'is it beyond an obvious swing? has it been swept? what does the '
        'departure reveal?</i> If any of the four cannot be answered, '
        'the signal must not be issued.', B))
    return out


def ch10_mtf(h):
    """Chapter 10 — Multi-Timeframe Context and Curve."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    _concept_entry = h['_concept_entry']
    mono_block = h['mono_block']

    out.append(P(
        '<i>Multi-timeframe context is the lens that decides which '
        'patterns matter. A perfect H1 setup against the H4 curve is a '
        'trap; the same setup with the H4 curve is a high-probability '
        'trade. Timeframe hierarchy is not optional.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>10.1  The MTF cluster</b>', H2))
    out.append(P(
        'Multi-Timeframe (MTF) context is the fifth foundational cluster. '
        'It is the meta-cluster — the cluster that decides which '
        'patterns from the other clusters are tradeable. This chapter '
        'covers six MTF concepts: Multi-Timeframe Context, Curve '
        '(revisited from the MTF perspective), Top-Down Analysis, '
        'Nested Zones (revisited from the MTF perspective), Timeframe '
        'Hierarchy, and HTF Bias vs LTF Execution. The chapter closes '
        'with a worked MTF Cascade example showing how a professional '
        'descends from Monthly to M15 to find an entry.', B))

    entries = [
        ('Multi-Timeframe Context', [
            ('Definition', 'The discipline of reading the highest relevant timeframe first and descending. Structure on the HTF constrains the LTF; patterns on the LTF are valid only in alignment with the HTF.'),
            ('Purpose', 'MTF context is the master filter. It eliminates 70%+ of LTF setups — the setups that fight the HTF. The remaining 30% are the only setups the professional trades.'),
            ('Context', 'MTF context is established at the start of every session. The professional identifies the HTF curve, the HTF zones, and the HTF liquidity — then descends to find LTF entries inside HTF zones.'),
            ('Why it forms', 'MTF context reflects the institutional hierarchy. The largest institutions operate on the highest timeframes; their positions take weeks to build and dominate all lower-timeframe activity. Lower-timeframe participants operate inside the gravitational field of the HTF institutions.'),
            ('How professionals identify it', 'Start at the highest relevant timeframe (Monthly or Weekly for swing, Daily for intraday). Identify the curve (HH/HL = bullish, LH/LL = bearish). Identify the active HTF zone. Descend one timeframe at a time, identifying zones and patterns that align with the HTF. The LTF entry must be inside an HTF zone and aligned with the HTF curve.'),
            ('Common mistakes', 'Starting at the LTF and trying to retrofit HTF context; treating LTF structure as equal to HTF structure; flip-flopping the HTF read on every LTF move; ignoring the HTF when a "perfect" LTF setup appears.'),
            ('Failure conditions', 'MTF context fails when the HTF structure shifts (CHoCH on the HTF). At that point all LTF setups aligned with the old HTF curve are invalid. The professional re-establishes MTF context before any new trades.'),
            ('Relationship to other concepts', 'MTF Context contains the Curve, Top-Down Analysis, Nested Zones, Timeframe Hierarchy, and HTF Bias vs LTF Execution; MTF Context is the meta-cluster that constrains every other cluster; MTF Context is the #1 determinant of trade quality.'),
            ('Probability contribution', 'MTF-aligned trade: ~70%. MTF-misaligned trade: ~30%. MTF context alone is the single largest probability modifier in RTM — larger than any single concept from any other cluster.'),
            ('Real chart example', 'EURUSD: Weekly curve bullish (HH/HL), Weekly demand at 1.0700-1.0800, price currently 1.0900. Daily structure bullish, Daily demand at 1.0850-1.0870. H1 demand at 1.0860-1.0870 (nested inside Daily demand). MTF context: bullish on Weekly and Daily; the H1 demand is aligned and nested — high-probability long. The professional enters long at 1.0865 with stop below 1.0850 and target at the next H1 supply.'),
        ]),
        ('Curve (MTF perspective)', [
            ('Definition', 'The Curve reconsidered as the highest-timeframe structure that constrains all lower-timeframe activity. The Curve is the institutional gravitational field; LTF patterns inside the Curve are amplified, LTF patterns against the Curve are suppressed.'),
            ('Purpose', 'From the MTF perspective, the Curve is the master direction. Every trade must be aligned with the Curve or have an explicit, structural reason to trade against it (e.g., a Curve shift setup).'),
            ('Context', 'The Curve is set on the highest relevant timeframe. For swing traders: Weekly or Monthly. For intraday traders: Daily or H4. The Curve is reviewed at the start of every session and re-evaluated on any HTF CHoCH.'),
            ('Why it forms', 'The Curve reflects the largest institutional positions. These positions take weeks to months to build and unwind; their direction dominates all LTF activity until they are closed. The Curve is the visible footprint of these positions.'),
            ('How professionals identify it', 'On the highest relevant timeframe, identify the structure (HH/HL = bullish Curve, LH/LL = bearish Curve, overlapping = neutral Curve). Identify the active HTF zone (the zone price is currently inside or approaching). The Curve is bullish if price is above the HTF demand with bullish HTF structure; bearish if below the HTF supply with bearish structure; neutral if inside a range.'),
            ('Common mistakes', 'Setting the Curve on too low a timeframe; flip-flopping the Curve on every HTF correction; ignoring the Curve when a "perfect" LTF setup appears against it; failing to revisit the Curve when HTF structure shifts.'),
            ('Failure conditions', 'The Curve shifts (not fails) when the HTF structure shifts. A CHoCH on the HTF is the early signal; a BOS confirms. Until confirmation, the old Curve remains in effect.'),
            ('Relationship to other concepts', 'The Curve is the highest-timeframe Structure; the Curve constrains every LTF pattern; the Curve is the primary input to Zone Quality; the Curve is the master direction for all trades; Curve misalignment is the #1 cause of LTF pattern failure.'),
            ('Probability contribution', 'Curve-aligned trade: +20% over base rate. Curve-misaligned trade: -25% (base rate inverted). The Curve is the single largest probability modifier in RTM.'),
            ('Real chart example', 'See MTF Context example. The Weekly bullish Curve amplifies the H1 demand zone; the same H1 demand against a bearish Weekly Curve would be a low-probability long (skip or require extreme confirmation).'),
        ]),
        ('Top-Down Analysis', [
            ('Definition', 'The sequence of timeframes the professional reads to establish MTF context: Monthly → Weekly → Daily → H4 → H1 → M15 (or a similar descent). Each timeframe\'s structure, zones, and liquidity are identified before descending.'),
            ('Purpose', 'Top-Down Analysis is the operational protocol for MTF context. It ensures no timeframe is skipped and that the HTF context is established before the LTF entry is sought.'),
            ('Context', 'Top-Down Analysis is performed at the start of every session and re-visited on any HTF structure shift. The descent is from highest to lowest relevant timeframe.'),
            ('Why it forms', 'Top-Down Analysis reflects the institutional hierarchy. The highest timeframes are dominated by the largest institutions; their positions dominate all lower timeframes. Reading from the top down ensures the professional starts with the dominant context and descends to find entries inside that context.'),
            ('How professionals identify it', 'For each timeframe in the descent: (1) identify structure (HH/HL, LH/LL, range), (2) identify the active zone (the zone price is approaching), (3) identify obvious liquidity pools (unswept swings). Descend to the next timeframe. Stop when the entry timeframe is reached. The entry must be inside an HTF zone and aligned with the HTF curve.'),
            ('Common mistakes', 'Skipping timeframes (e.g., jumping from Weekly to M15); reading bottom-up (LTF first, then trying to retrofit HTF); treating every timeframe as equal (HTF dominates); failing to descend (staying on the HTF and never finding the LTF entry).'),
            ('Failure conditions', 'Top-Down Analysis fails when the descent is incomplete or the HTF context is misread. The professional re-performs the analysis from the top on any HTF structure shift.'),
            ('Relationship to other concepts', 'Top-Down Analysis is the operational protocol for MTF Context; Top-Down Analysis contains the Curve (at the top), Nested Zones (across the descent), and LTF Execution (at the bottom); Top-Down Analysis is the method by which Timeframe Hierarchy is enforced.'),
            ('Probability contribution', 'Trades selected via complete Top-Down Analysis: ~70%. Trades selected without Top-Down (LTF only): ~45%. The protocol itself is a +25% lift over ad-hoc analysis.'),
            ('Real chart example', 'See MTF Cascade worked example at the end of this chapter.'),
        ]),
        ('Nested Zones (MTF perspective)', [
            ('Definition', 'Nested Zones reconsidered as the MTF confluence that amplifies zone quality. A nested zone is an LTF zone inside an HTF zone — the same price band contains unfilled institutional inventory on multiple timeframes.'),
            ('Purpose', 'From the MTF perspective, Nested Zones are the highest-probability trade locations. The professional actively hunts for nesting; nested zones are must-react candidates, standalone zones are may-react candidates.'),
            ('Context', 'Nesting is identified during Top-Down Analysis. The HTF zone is identified first; the descent reveals LTF zones inside the HTF zone. The more timeframes nested, the stronger the confluence.'),
            ('Why it forms', 'Institutions operating on different timeframes build positions at the same price levels — major swing points are visible to all participants. When a Daily demand zone and an H1 demand zone overlap, both daily-scale and H1-scale institutions have unfilled inventory at that price.'),
            ('How professionals identify it', 'During Top-Down Analysis, when an LTF zone is identified, check whether its price band falls inside an HTF zone. If yes, the LTF zone is nested. The more HTF zones overlapping, the stronger the nesting.'),
            ('Common mistakes', 'Treating adjacent (non-overlapping) zones as nested; ignoring the HTF zone\'s freshness (a nested LTF zone inside a consumed HTF zone is much weaker); counting the same zone on multiple timeframes as nesting (must be different zones).'),
            ('Failure conditions', 'Nesting fails when the HTF parent zone is broken. At that point the LTF child zone\'s nesting confluence is gone; the child reverts to standalone quality.'),
            ('Relationship to other concepts', 'Nested Zones is the primary MTF confluence; Nested Zones amplify Zone Quality; Nested Zones are required for must-react classification; Nested Zones are the engine of Top-Down Analysis; the deepest nesting (3+ timeframes) produces the highest-probability setups in RTM.'),
            ('Probability contribution', 'Single zone: base rate. Nested in one HTF zone: +12%. Nested in two HTF zones: +22%. Nested in three HTF zones: +30%. Nesting is the second-largest probability modifier after curve alignment.'),
            ('Real chart example', 'See MTF Cascade worked example.'),
        ]),
        ('Timeframe Hierarchy', [
            ('Definition', 'The rule that a structure on a higher timeframe dominates a conflicting structure on a lower timeframe. HTF structure overrides LTF structure; HTF zones override LTF zones; HTF liquidity overrides LTF liquidity.'),
            ('Purpose', 'Timeframe Hierarchy resolves conflicts. When the H1 structure is bullish but the H4 structure is bearish, the H4 wins — the H1 bullishness is a counter-trend bounce inside the H4 downtrend, not a reversal.'),
            ('Context', 'Timeframe Hierarchy applies to every structural element: structure, zones, liquidity, patterns. The HTF version always dominates the LTF version when they conflict.'),
            ('Why it forms', 'Timeframe Hierarchy reflects the institutional hierarchy. Larger institutions (HTF) dominate smaller institutions (LTF). The HTF institutions\' positions take longer to build and unwind; their direction dominates until they are closed.'),
            ('How professionals identify it', 'When two timeframes conflict, defer to the higher. Specifically: HTF curve bullish + LTF curve bearish = treat as bullish (LTF bearishness is a correction). HTF zone intact + LTF zone broken = treat the HTF zone as intact (the LTF break is a liquidity event within the HTF zone). HTF liquidity unswept + LTF liquidity swept = the HTF liquidity is still a target.'),
            ('Common mistakes', 'Treating LTF structure as equal to HTF structure; flip-flopping the HTF read on every LTF move; ignoring the HTF when an LTF setup appears; treating an LTF zone break as invalidating the HTF zone (only HTF structure shifts invalidate HTF zones).'),
            ('Failure conditions', 'Timeframe Hierarchy fails only when the HTF structure itself shifts (CHoCH on the HTF). Until then, the HTF dominates unconditionally.'),
            ('Relationship to other concepts', 'Timeframe Hierarchy is the rule that enforces MTF Context; Timeframe Hierarchy resolves conflicts between Curve (HTF) and LTF structure; Timeframe Hierarchy determines which Nested Zones are valid; Timeframe Hierarchy is the rule by which the future engine must resolve conflicting signals across timeframes.'),
            ('Probability contribution', 'Trades that respect Timeframe Hierarchy: ~70%. Trades that violate it: ~30%. Respecting hierarchy is a +40% swing over violating it.'),
            ('Real chart example', 'EURUSD: H4 structure bearish (LH/LL). H1 structure bullish (HH/HL). Timeframe Hierarchy says: H4 wins. The H1 bullishness is a correction inside the H4 downtrend. Look for shorts at H1 supply zones that align with H4 supply (nested); ignore H1 demand zones (they are counter-curve and low-probability).'),
        ]),
        ('HTF Bias vs LTF Execution', [
            ('Definition', 'The division of labour between timeframes: the HTF provides the bias (direction), the LTF provides the execution (entry timing). The HTF decides whether to trade long or short; the LTF decides exactly where to enter.'),
            ('Purpose', 'HTF Bias vs LTF Execution is the operational principle that prevents the professional from trading LTF setups against the HTF bias. The LTF is for timing, not for direction; direction comes from the HTF.'),
            ('Context', 'HTF Bias is set on the highest relevant timeframe. LTF Execution occurs on the entry timeframe (typically 2-4 timeframes below the HTF). Between them, intermediate timeframes provide nesting and confirmation.'),
            ('Why it forms', 'The division exists because HTF institutions set the direction and LTF institutions provide the liquidity. The professional rides the HTF direction and uses the LTF to time entries at HTF-aligned zones.'),
            ('How professionals identify it', 'Set HTF Bias: read the Curve on the HTF. If bullish, only longs. If bearish, only shorts. If neutral, no trades. LTF Execution: descend to the LTF, identify zones aligned with the HTF Bias, enter on LTF triggers (engulf, decision candle, sweep reversal) inside those zones.'),
            ('Common mistakes', 'Letting the LTF change the HTF bias (the LTF cannot change the HTF — only HTF structure shifts can); entering LTF setups against the HTF bias without an explicit Curve shift setup; treating the LTF as the decision timeframe (it is the execution timeframe).'),
            ('Failure conditions', 'HTF Bias vs LTF Execution fails when the HTF structure shifts. At that point the old HTF Bias is invalid; the professional re-establishes the bias before any new trades.'),
            ('Relationship to other concepts', 'HTF Bias vs LTF Execution is the operational form of MTF Context and Timeframe Hierarchy; HTF Bias is the Curve applied; LTF Execution is the entry-timing application of all pattern concepts; the principle ensures that LTF patterns are only traded in alignment with HTF direction.'),
            ('Probability contribution', 'HTF-aligned LTF execution: ~70%. HTF-misaligned LTF execution: ~30%. The principle is the operational version of Timeframe Hierarchy and produces the same +40% swing.'),
            ('Real chart example', 'EURUSD: Daily Curve bullish. The professional only looks for longs. On H1, they identify a fresh demand zone at 1.0870 nested inside the Daily demand at 1.0850-1.0880. They wait for an H1 engulf or decision candle at 1.0870 to enter long. They ignore the H1 supply at 1.0940 — it is against the Daily Curve and therefore untradeable.'),
        ]),
    ]

    for name, fields in entries:
        out.extend(_concept_entry(name, fields))

    out.append(P('<b>10.2  Worked example — the MTF Cascade</b>', H2))
    out.append(P(
        'The MTF Cascade is the full Top-Down Analysis applied to a '
        'specific instrument. The example below shows a hypothetical '
        'EURUSD setup, descending from Monthly to M15. The professional '
        'reads each timeframe, identifies the relevant structures, and '
        'descends — looking for the LTF entry inside the HTF context.', B))
    out.append(S(1, 4))
    out.append(mono_block([
        'EURUSD MTF CASCADE — HYPOTHETICAL',
        '',
        'MONTHLY:',
        '  Structure: HH/HL since 1.0600 low. Bullish curve.',
        '  Active zone: Monthly demand at 1.0700-1.0800.',
        '  Liquidity: Unswept Monthly high at 1.1280 (MPL).',
        '  => Bias: LONG only. Target: 1.1280.',
        '',
        'WEEKLY:',
        '  Structure: HH/HL. Bullish, aligned with Monthly.',
        '  Active zone: Weekly demand at 1.0820-1.0850.',
        '  Liquidity: Unswept Weekly high at 1.1100.',
        '  => Bias: LONG. Next intermediate target: 1.1100.',
        '',
        'DAILY:',
        '  Structure: HH/HL. Bullish, aligned with Weekly.',
        '  Active zone: Daily demand at 1.0860-1.0880.',
        '  Liquidity: Unswept Daily high at 1.0960.',
        '  => Bias: LONG. Entry zone: 1.0860-1.0880.',
        '',
        'H4:',
        '  Structure: HL at 1.0855 (inside Daily demand). Bullish.',
        '  Active zone: H4 demand at 1.0865-1.0875 (nested in Daily).',
        '  Liquidity: H4 sell-side pool at 1.0855 (Asian session low).',
        '  => Bias: LONG. Entry zone refined: 1.0865-1.0875.',
        '',
        'H1:',
        '  Structure: HL at 1.0870. Bullish.',
        '  Active zone: H1 demand at 1.0868-1.0875 (nested in H4 and Daily).',
        '  Liquidity: H1 sell-side pool at 1.0865.',
        '  => Bias: LONG. Entry trigger: engulf or decision candle at 1.0868-1.0875.',
        '',
        'M15:',
        '  Structure: Compression at 1.0870-1.0878 (5 candles).',
        '  Liquidity: M15 sell-side pool at 1.0868 (just below the H1 zone).',
        '  => TRIGGER: price sweeps 1.0868, reverses with M15 engulf.',
        '     Enter long on engulf close (1.0875).',
        '     Stop: below 1.0860 (below H1 zone distal line).',
        '     Target 1: 1.0960 (Daily liquidity).',
        '     Target 2: 1.1100 (Weekly liquidity).',
        '     Target 3: 1.1280 (Monthly MPL).',
        '',
        'WHY THIS WORKS:',
        '  - Direction set by Monthly Curve (highest authority).',
        '  - Zone nested in 3 timeframes (Daily, H4, H1) — must-react.',
        '  - Entry triggered by M15 sweep reversal — highest-probability trigger.',
        '  - Targets are HTF liquidity pools — price is biased to visit them.',
        '  - Invalidation is structural (below H1 zone distal), not arbitrary.',
    ]))
    out.append(P(
        'The MTF Cascade is the operational form of every concept in '
        'this volume. Every chapter feeds into it: structure defines the '
        'curve, zones define the location, patterns define the trigger, '
        'liquidity defines the target, and MTF context ties them '
        'together. The future engine\'s reasoning module should output '
        'exactly this kind of cascade for every trade — direction by '
        'curve, location by nested zones, trigger by pattern, target by '
        'liquidity, invalidation by structure.', B))
    return out


def ch11_knowledge_graph(h):
    """Chapter 11 — The RTM Knowledge Graph."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    std_table, TBL_HEADER, TBL_CELL, TBL_CELL_BOLD = (
        h['std_table'], h['TBL_HEADER'], h['TBL_CELL'], h['TBL_CELL_BOLD'])
    Image = h['Image']

    out.append(P(
        '<i>The knowledge graph is the formal statement of how every '
        'concept links to every other. The future engine\'s reasoning '
        'module traverses this graph to generate WHY chains.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>11.1  Why a graph, not a list</b>', H2))
    out.append(P(
        'A list of definitions produces a system that recognises patterns '
        'but cannot reason about them. A graph of relationships produces a '
        'system that can traverse from cause to effect, from confirmation '
        'to invalidation, from a single observation to a multi-concept '
        'trade thesis. The knowledge graph is therefore the single most '
        'important artefact in this volume: it is the data structure the '
        'future engine\'s reasoning module will operate on.', B))
    out.append(P(
        'Every concept in Chapters 5–10 is a node in the graph. Every '
        '"Relationship to other concepts" field in those entries is a set '
        'of edges. The graph is fully connected — every concept is '
        'reachable from every other concept through at most 3-4 edges. '
        'This connectivity is what allows the engine to compose concepts '
        'into trade theses.', B))

    out.append(P('<b>11.2  The six clusters</b>', H2))
    out.append(P(
        'The graph organises concepts into six clusters: Structure, '
        'Zones, Patterns, Liquidity, Quality, and MTF. Each cluster is '
        'internally dense (many edges within the cluster) and externally '
        'sparser (fewer edges between clusters). The cluster boundaries '
        'are not rigid — Curve is in Structure but is also the apex of '
        'MTF; Zone Quality is in Quality but draws inputs from Zones, '
        'MTF, and Patterns. The clusters are an organisational '
        'convenience, not a fundamental division.', B))

    out.append(P('<b>11.3  Edge-type taxonomy</b>', H2))
    out.append(P(
        'The graph uses six edge types. Each edge type represents a '
        'distinct relationship between concepts. The future engine\'s '
        'reasoning module must distinguish edge types — they have '
        'different implications for trade logic.', B))
    out.append(S(1, 6))
    edge_data = [[
        P('Edge type', TBL_HEADER),
        P('Meaning', TBL_HEADER),
        P('Example', TBL_HEADER),
    ]]
    edges = [
        ('is-a', 'A is a specialisation of B (inheritance).', 'QM is-a Reversal Pattern.'),
        ('part-of', 'A is a component of B (composition).', 'Base is-part-of every Supply and Demand zone.'),
        ('precedes', 'A typically occurs before B in time.', 'Base precedes Engulf (the departure creates the engulf).'),
        ('confirms', 'A validates the existence or validity of B.', 'BOS confirms the impulse (and therefore the base).'),
        ('invalidates', 'A causes B to cease being valid.', 'Curve shift invalidates LTF patterns aligned with the old curve.'),
        ('amplifies-probability-of', 'A increases the reaction probability of B.', 'FTR amplifies the probability of a zone reaction.'),
    ]
    for et, mean, ex in edges:
        edge_data.append([P(et, TBL_CELL_BOLD), P(mean, TBL_CELL), P(ex, TBL_CELL)])
    out.extend(std_table(
        edge_data,
        col_ratios=[0.20, 0.40, 0.40],
        caption_text='Table 11.1 — Knowledge graph edge types.'
    ))

    out.append(P('<b>11.4  Master graph overview</b>', H2))
    out.append(P(
        'The master graph below shows the six clusters and the primary '
        'edges between them. Each cluster is shown as a node; edges '
        'represent the dominant inter-cluster relationships. The '
        'intra-cluster edges (within each cluster) are detailed in the '
        'cluster-specific tables later in this chapter.', B))
    out.append(S(1, 4))

    # Master graph diagram
    master_diagram = _make_master_graph_diagram(h)
    out.append(master_diagram)
    out.append(P('Figure 11.1 — RTM Knowledge Graph: master overview. Six clusters and their primary inter-cluster edges.', h['CAPTION']))

    out.append(P('<b>11.5  Concept-to-concept edges</b>', H2))
    out.append(P(
        'The table below lists the most important concept-to-concept '
        'edges in the knowledge graph. It is not exhaustive — every '
        'concept\'s "Relationship to other concepts" field contributes '
        'edges — but it captures the edges the future engine will '
        'traverse most often during reasoning.', B))
    out.append(S(1, 6))
    edge_table = [[
        P('Source concept', TBL_HEADER),
        P('Edge type', TBL_HEADER),
        P('Target concept', TBL_HEADER),
        P('Reasoning implication', TBL_HEADER),
    ]]
    concept_edges = [
        ('Curve', 'constrains', 'Market Structure', 'HTF structure overrides LTF; the curve is the master direction.'),
        ('Market Structure', 'composed_of', 'Swings', 'Swings are the atomic units of structure.'),
        ('Impulse', 'breaks_swing', 'BOS', 'A close beyond a swing is a BOS; BOS confirms the impulse.'),
        ('BOS', 'confirms', 'Base', 'Without BOS, the base is unconfirmed and not a tradeable zone.'),
        ('Base', 'part_of', 'Supply / Demand', 'Every zone has a base at its origin.'),
        ('Departure', 'creates', 'FTR', 'Strong departure + no return = FTR.'),
        ('FTR', 'amplifies_probability_of', 'Zone reaction', 'FTR-confirmed zones are +15% over base rate.'),
        ('Compression', 'precedes', 'Engulf', 'The compression resolve is often an engulf.'),
        ('Engulf', 'confirms', 'Zone reaction', 'Without an engulf, the zone reaction is unconfirmed.'),
        ('Sweep', 'precedes', 'QM head', 'The QM head is a sweep of a liquidity pool.'),
        ('QM', 'is_a', 'Reversal Pattern', 'QM is a specialisation of reversal pattern.'),
        ('Liquidity Pool', 'target_of', 'IPDA Manipulation', 'The IPDA targets pools to fill large orders.'),
        ('Stop Hunt', 'event_of', 'Sweep', 'A stop hunt is the event of sweeping a liquidity pool.'),
        ('Curve', 'primary_input_of', 'Zone Quality', 'Curve alignment is the largest quality modifier.'),
        ('Nested Zones', 'amplifies_probability_of', 'Zone reaction', 'Nesting is the second-largest quality modifier.'),
        ('CHoCH', 'precedes', 'Reversal BOS', 'CHoCH is the early signal; BOS confirms the reversal.'),
        ('Decision Point', 'amplifies_probability_of', 'Pattern', 'Patterns at decision points are highest-probability.'),
        ('MPL', 'is_a', 'Liquidity Pool', 'MPL is the highest-timeframe liquidity pool.'),
        ('Timeframe Hierarchy', 'enforces', 'MTF Context', 'HTF overrides LTF when they conflict.'),
        ('Top-Down Analysis', 'operationalises', 'MTF Context', 'The protocol by which MTF context is established.'),
    ]
    for s, et, t, impl in concept_edges:
        edge_table.append([
            P(s, TBL_CELL_BOLD), P(et, TBL_CELL),
            P(t, TBL_CELL_BOLD), P(impl, TBL_CELL),
        ])
    out.extend(std_table(
        edge_table,
        col_ratios=[0.18, 0.16, 0.18, 0.48],
        caption_text='Table 11.2 — Selected concept-to-concept edges in the RTM knowledge graph.'
    ))

    out.append(P('<b>11.6  How the future engine should traverse the graph</b>', H2))
    out.append(P(
        'The future engine\'s reasoning module must traverse the graph '
        'to generate a WHY chain for every signal. The traversal '
        'protocol is as follows:', B))
    out.append(S(1, 4))
    out.extend(h['numbered_list']([
        '<b>Identify the candidate pattern.</b> The pattern recogniser outputs a candidate (e.g., "engulf at zone X"). This is the starting node.',
        '<b>Traverse confirmation edges.</b> From the candidate, traverse <i>confirms</i> and <i>amplifies-probability-of</i> edges to identify what confirms the candidate (BOS? FTR? Curve alignment? Nesting?).',
        '<b>Traverse invalidation edges.</b> From the candidate, traverse <i>invalidates</i> edges to identify what would invalidate it (curve shift? zone consumption? sweep failure?).',
        '<b>Traverse context edges.</b> From the candidate, traverse <i>part-of</i> and <i>is-a</i> edges to identify the broader context (the zone is part of a Decision Point? the engulf is part of a QM?).',
        '<b>Compose the WHY chain.</b> Combine the traversals into a single chain: <i>pattern X at location Y, confirmed by Z, invalidated by W, in context V</i>. The chain is the engine\'s reasoning output.',
        '<b>Reject if incomplete.</b> If any traversal fails to produce a node (e.g., no confirmation found, no invalidation identified), the signal must not be issued. The engine needs a complete chain to trade.',
    ]))
    out.append(P(
        'This protocol ensures the engine never issues a signal without '
        'a complete WHY chain. A signal without a chain is gambling; a '
        'signal with a chain is trading. The graph is what makes the '
        'chain possible.', B))
    return out


def _make_master_graph_diagram(h):
    """Generate a simple master graph diagram as an Image flowable.

    Uses a pre-generated PNG; if missing, returns a textual placeholder.
    """
    import os
    png_path = '/home/z/my-project/scripts/kg_master.png'
    if os.path.exists(png_path):
        from PIL import Image as PILImage
        pil = PILImage.open(png_path)
        w, hh = pil.size
        max_w = h['CONTENT_W']
        max_h = 360
        ratio = min(max_w / w, max_h / hh)
        return h['Image'](png_path, width=w * ratio, height=hh * ratio)
    # Fallback: textual description in a callout
    return h['callout'](
        'Master graph (textual)',
        [
            'STRUCTURE  →  constrains  →  ZONES / PATTERNS / LIQUIDITY',
            'ZONES      ←  amplifies   ←  PATTERNS (engulf confirms zone)',
            'ZONES      ←  amplifies   ←  LIQUIDITY (sweep at zone = high-prob)',
            'ZONES      →  feeds       →  QUALITY (freshness, nesting, etc.)',
            'QUALITY    →  filters     →  PATTERNS (only high-quality zones trigger entries)',
            'MTF        →  constrains  →  ALL CLUSTERS (curve is the master direction)',
            'LIQUIDITY  →  targets     →  PATTERNS (QM head = sweep of liquidity)',
        ]
    )


def ch12_failures(h):
    """Chapter 12 — Failure Catalog."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    std_table, TBL_HEADER, TBL_CELL, TBL_CELL_BOLD = (
        h['std_table'], h['TBL_HEADER'], h['TBL_CELL'], h['TBL_CELL_BOLD'])

    out.append(P(
        '<i>Every structure fails sometimes. The professional knows the '
        'failure modes by heart — and so must the future engine. A '
        'failure mode is part of the pattern definition, not an '
        'afterthought.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>12.1  Why cataloguing failures matters</b>', H2))
    out.append(P(
        'A trading system that knows only the success conditions of its '
        'patterns will lose money. It will enter every apparent engulf at '
        'every apparent zone, and a significant fraction of those entries '
        'will be at fake patterns that fail. The cost of the failures '
        'will exceed the profit from the successes. The system must know '
        'the failure conditions with the same precision it knows the '
        'success conditions — and it must check both before every entry.', B))
    out.append(P(
        'This chapter catalogs the failure modes of the six most common '
        'RTM structures: zones, FTRs, engulfs, QMs, flag limits, and '
        'diamonds. For each, the catalog lists the failure mode, why it '
        'happens, the early warning signs, and the probability impact. '
        'The future engine should encode every row as an explicit '
        'invalidation check.', B))

    # ── 12.2 Zone Failure ─────────────────────────────────────────────
    out.append(P('<b>12.2  Zone failure</b>', H2))
    out.append(P(
        'A zone fails when price returns and closes decisively beyond '
        'the proximal line, without the expected reaction. The unfilled '
        'inventory that was supposed to react has been absorbed — either '
        'by stronger opposing flow or because the institution that left '
        'the orders has finished its position.', B))
    zone_fail_data = [[
        P('Failure mode', TBL_HEADER),
        P('Why it happens', TBL_HEADER),
        P('Early warning signs', TBL_HEADER),
        P('Probability impact', TBL_HEADER),
    ]]
    zone_fails = [
        ('Curve misalignment',
         'The zone is being approached against the HTF curve. The HTF institution is pushing price through the zone, not reacting to it.',
         'HTF structure is opposite to the zone direction; zone is counter-curve.',
         'Base rate inverted (≈35% reaction).'),
        ('Weak departure',
         'The original departure from the base was weak — small bodies, large wicks, no BOS. The institutional commitment was never there.',
         'Original departure candle has <60% body, no clean BOS.',
         '−15% from base rate.'),
        ('No liquidity above/below',
         'There is no liquidity pool beyond the zone for the IPDA to target after the reaction. Without a target, the IPDA has no reason to react.',
         'No obvious unswept swing beyond the zone in the reaction direction.',
         '−10% from base rate.'),
        ('Zone is consumed',
         'The zone has been touched 2+ times; the institutional inventory is depleted.',
         'Multiple prior touches with diminishing reactions.',
         '−25% to −50% depending on touch count.'),
        ('HTF structure shift',
         'Between zone creation and the return, the HTF structure has shifted (CHoCH on the HTF). The zone is no longer aligned with the institutional intent.',
         'HTF CHoCH occurred after zone creation; HTF curve has flipped.',
         'Base rate inverted (≈30%).'),
        ('Sweep, not reaction',
         'Price penetrates the zone to grab liquidity beyond it, then continues. The zone is consumed as a side effect of the liquidity grab.',
         'Liquidity pool just beyond the zone in the approach direction; approach is impulsive.',
         '−20% from base rate (zone is consumed after the sweep).'),
    ]
    for fm, why, signs, impact in zone_fails:
        zone_fail_data.append([
            P(fm, TBL_CELL_BOLD), P(why, TBL_CELL),
            P(signs, TBL_CELL), P(impact, TBL_CELL),
        ])
    out.extend(std_table(
        zone_fail_data,
        col_ratios=[0.18, 0.32, 0.32, 0.18],
        caption_text='Table 12.1 — Zone failure modes.'
    ))

    # ── 12.3 FTR Failure ──────────────────────────────────────────────
    out.append(P('<b>12.3  FTR failure</b>', H2))
    out.append(P(
        'An FTR fails when price returns to the base after the FTR was '
        'established. The non-return was temporary; new opposing '
        'liquidity has accumulated and pushed price back to the base.', B))
    ftr_fail_data = [[
        P('Failure mode', TBL_HEADER),
        P('Why it happens', TBL_HEADER),
        P('Early warning signs', TBL_HEADER),
        P('Probability impact', TBL_HEADER),
    ]]
    ftr_fails = [
        ('Curve shift',
         'The HTF curve has shifted since the FTR was established. The institution that drove the original departure has reversed; the FTR is no longer aligned.',
         'HTF CHoCH; HTF structure has flipped.',
         'FTR completely invalid; zone is now counter-curve.'),
        ('IPDA re-accumulation',
         'A new institution has built a position against the original departure. The FTR-confirmed zone is being consumed by this new institution.',
         'Compression forming at the FTR-confirmed zone; opposing structure building.',
         '−20% from FTR-confirmed base rate.'),
        ('Time decay',
         'The FTR was established long ago (weeks to months). New opposing liquidity has slowly accumulated; the FTR is no longer fresh.',
         'Long time elapsed since FTR; multiple minor touches.',
         '−10% to −15% from FTR-confirmed base rate.'),
        ('HTF liquidity target reached',
         'The IPDA has reached its HTF liquidity target and is reversing. The FTR-confirmed zone is on the path of the reversal.',
         'Price has reached a major HTF liquidity pool; reversal signs appearing.',
         'FTR intact but trade direction should reverse; do not trade the FTR-confirmed zone in the original direction.'),
    ]
    for fm, why, signs, impact in ftr_fails:
        ftr_fail_data.append([
            P(fm, TBL_CELL_BOLD), P(why, TBL_CELL),
            P(signs, TBL_CELL), P(impact, TBL_CELL),
        ])
    out.extend(std_table(
        ftr_fail_data,
        col_ratios=[0.18, 0.32, 0.32, 0.18],
        caption_text='Table 12.2 — FTR failure modes.'
    ))

    # ── 12.4 Engulf Failure ───────────────────────────────────────────
    out.append(P('<b>12.4  Engulf failure</b>', H2))
    out.append(P(
        'An engulf fails when the next candle reclaims ≥50% of the '
        'engulf\'s range. The institutional commitment was fake — likely '
        'a liquidity event rather than a directional commitment.', B))
    engulf_fail_data = [[
        P('Failure mode', TBL_HEADER),
        P('Why it happens', TBL_HEADER),
        P('Early warning signs', TBL_HEADER),
        P('Probability impact', TBL_HEADER),
    ]]
    engulf_fails = [
        ('No follow-through',
         'The engulf was a single-candle event with no institutional backing. The next candle reveals the absence of commitment.',
         'Next candle is a doji or reverses ≥50% of the engulf.',
         '−25% from engulf base rate.'),
        ('Fake sweep',
         'The engulf was actually a liquidity sweep that happened to look like an engulf. The IPDA was filling orders, not committing direction.',
         'Engulf occurred just beyond an obvious swing; volume spike; immediate reversal.',
         '−30% — treat as a sweep, not an engulf.'),
        ('Counter-curve',
         'The engulf is against the HTF curve. The HTF institution absorbs the engulf\'s aggression; the LTF engulf fails.',
         'HTF curve opposite to engulf direction; engulf on LTF only.',
         '−20% from base rate.'),
        ('Weak body proportion',
         'The engulf\'s body barely covers the prior candle. The institutional aggression is marginal.',
         'Body proportion <60%; large wicks.',
         '−15% from base rate.'),
    ]
    for fm, why, signs, impact in engulf_fails:
        engulf_fail_data.append([
            P(fm, TBL_CELL_BOLD), P(why, TBL_CELL),
            P(signs, TBL_CELL), P(impact, TBL_CELL),
        ])
    out.extend(std_table(
        engulf_fail_data,
        col_ratios=[0.18, 0.32, 0.32, 0.18],
        caption_text='Table 12.3 — Engulf failure modes.'
    ))

    # ── 12.5 QM Failure ───────────────────────────────────────────────
    out.append(P('<b>12.5  QM failure</b>', H2))
    out.append(P(
        'A QM fails when price returns to the shoulder level and breaks '
        'it (instead of reacting). The intent shift was fake — the head '
        'was not a sweep but real continuation.', B))
    qm_fail_data = [[
        P('Failure mode', TBL_HEADER),
        P('Why it happens', TBL_HEADER),
        P('Early warning signs', TBL_HEADER),
        P('Probability impact', TBL_HEADER),
    ]]
    qm_fails = [
        ('Right shoulder below true liquidity',
         'The shoulder level was not a real liquidity pool — the sweep of the head did not target significant resting orders. The QM structure is artificial.',
         'Shoulder level has no obvious prior swing; head sweep was small.',
         '−25% from QM base rate.'),
        ('Counter-curve QM',
         'The QM is against the HTF curve. The HTF institution absorbs the QM\'s reversal attempt.',
         'HTF curve opposite to QM reversal direction.',
         '−30% — skip.'),
        ('No CHoCH confirmation',
         'The QM is missing the BOS/CHoCH between head and shoulder. The intent shift was never structurally confirmed.',
         'No close beyond the prior counter-trend swing after the head.',
         '−20% — wait for CHoCH before entering.'),
        ('Head was not a sweep',
         'The head was a real continuation, not a sweep. The QM is misidentified.',
         'No liquidity pool beyond the head; head close is strong in the trend direction.',
         '−40% — not a QM, do not trade.'),
    ]
    for fm, why, signs, impact in qm_fails:
        qm_fail_data.append([
            P(fm, TBL_CELL_BOLD), P(why, TBL_CELL),
            P(signs, TBL_CELL), P(impact, TBL_CELL),
        ])
    out.extend(std_table(
        qm_fail_data,
        col_ratios=[0.22, 0.30, 0.30, 0.18],
        caption_text='Table 12.4 — QM failure modes.'
    ))

    # ── 12.6 FL Failure ───────────────────────────────────────────────
    out.append(P('<b>12.6  Flag Limit failure</b>', H2))
    out.append(P(
        'An FL fails when price decisively breaks it AND closes beyond. '
        'The flag was the first leg of a reversal, not a continuation.', B))
    fl_fail_data = [[
        P('Failure mode', TBL_HEADER),
        P('Why it happens', TBL_HEADER),
        P('Early warning signs', TBL_HEADER),
        P('Probability impact', TBL_HEADER),
    ]]
    fl_fails = [
        ('HTF shift',
         'The HTF structure has shifted; the flag was the first leg of the HTF reversal. The FL is broken in the reversal direction.',
         'HTF CHoCH; deep retracement beyond the FL.',
         'FL fully invalid; treat as reversal, not continuation.'),
        ('Deep flag (>62%)',
         'The flag retraced more than 62% of the impulse. The trend was already weak; the FL break is the confirmation of reversal.',
         'Flag retracement >62%; overlapping structure breakdown.',
         '−20% from FL base rate.'),
        ('No impulse confirmation',
         'The original impulse was weak. The flag is just a pause in a non-trend; the FL is not significant.',
         'Original impulse lacks BOS or strength.',
         '−15% from FL base rate.'),
    ]
    for fm, why, signs, impact in fl_fails:
        fl_fail_data.append([
            P(fm, TBL_CELL_BOLD), P(why, TBL_CELL),
            P(signs, TBL_CELL), P(impact, TBL_CELL),
        ])
    out.extend(std_table(
        fl_fail_data,
        col_ratios=[0.18, 0.32, 0.32, 0.18],
        caption_text='Table 12.5 — Flag Limit failure modes.'
    ))

    # ── 12.7 Diamond Failure ──────────────────────────────────────────
    out.append(P('<b>12.7  Diamond failure</b>', H2))
    out.append(P(
        'A Diamond fails when price breaks the diamond in the trend '
        'direction with strength and continues. The apparent '
        'distribution was real continuation; the diamond was a flag.', B))
    dia_fail_data = [[
        P('Failure mode', TBL_HEADER),
        P('Why it happens', TBL_HEADER),
        P('Early warning signs', TBL_HEADER),
        P('Probability impact', TBL_HEADER),
    ]]
    dia_fails = [
        ('Asymmetric liquidity',
         'The diamond formed without symmetric liquidity on both sides. The distribution was one-sided; the reversal setup is artificial.',
         'No liquidity pool on one side of the diamond; asymmetric range.',
         '−20% from diamond base rate.'),
        ('Trend-direction break',
         'Price breaks the diamond in the trend direction with strength. The diamond was a flag, not a distribution.',
         'Strong close beyond the trend-direction edge of the diamond.',
         'Diamond invalid; treat as continuation.'),
        ('No prior extended trend',
         'The diamond formed without a prior extended trend. There is nothing to reverse; the diamond is just a range.',
         'Prior move was shallow or short; no extended impulse.',
         '−25% — not a diamond, do not trade.'),
    ]
    for fm, why, signs, impact in dia_fails:
        dia_fail_data.append([
            P(fm, TBL_CELL_BOLD), P(why, TBL_CELL),
            P(signs, TBL_CELL), P(impact, TBL_CELL),
        ])
    out.extend(std_table(
        dia_fail_data,
        col_ratios=[0.20, 0.30, 0.30, 0.20],
        caption_text='Table 12.6 — Diamond failure modes.'
    ))

    out.append(P('<b>12.8  Fakes vs real — the decision callout</b>', H2))
    out.append(P(
        'The single most valuable skill in RTM is distinguishing real '
        'structures from fakes. The decision callout below summarises '
        'the heuristic the professional applies. The future engine must '
        'encode this heuristic as a final filter before any signal is '
        'issued.', B))
    out.append(S(1, 6))
    out.append(CL('Fakes vs Real — the decision heuristic', [
        '<b>Real structures have:</b> curve alignment, FTR confirmation, HTF nesting, liquidity targets beyond, strong departures, decision-point confluence, and complete WHY chains.',
        '<b>Fake structures have:</b> counter-curve alignment, no FTR, no HTF nesting, no liquidity targets, weak departures, isolated location, and incomplete WHY chains.',
        '<b>Default rule:</b> when in doubt, the structure is fake. The professional requires positive evidence of realness; absence of evidence of fakeness is not enough. The default is no trade.',
        '<b>Final filter:</b> if any failure mode from Tables 12.1–12.6 is present, the structure is fake or compromised. Skip. There will be another setup tomorrow.',
    ]))
    return out


def ch13_chart_study(h):
    """Chapter 13 — Chart Study Framework."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    mono_block = h['mono_block']
    numbered_list = h['numbered_list']

    out.append(P(
        '<i>Chart study is what professionals do before they look for '
        'trades. The amateur opens a chart and asks "where can I enter?"; '
        'the professional opens a chart and asks "what is the story of '
        'this market?" The trade emerges from the story.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>13.1  The six-pass reading protocol</b>', H2))
    out.append(P(
        'The professional reads a chart in six passes, each building on '
        'the previous. The passes are performed in strict order — '
        'skipping a pass produces an incomplete read and an incomplete '
        'read produces losing trades. The protocol takes 5-15 minutes '
        'per chart on first reading; with practice, 2-5 minutes.', B))

    out.append(P('<b>13.2  Pass 1 — Curve</b>', H3))
    out.append(P(
        '<b>What to look for:</b> Open the highest relevant timeframe '
        '(Monthly or Weekly for swing, Daily for intraday). Identify '
        'the structure: HH/HL = bullish curve, LH/LL = bearish curve, '
        'overlapping = neutral. Identify the active HTF zone (the zone '
        'price is currently approaching or inside). Identify the '
        'nearest HTF liquidity target (the MPL — the most significant '
        'unswept swing in the curve direction).', B))
    out.append(P(
        '<b>Decision:</b> Set the bias. Bullish curve = longs only. '
        'Bearish curve = shorts only. Neutral = no trades. This bias is '
        'the master direction for all subsequent passes; it cannot be '
        'overridden by lower-timeframe readings.', B))
    out.append(P(
        '<b>Common error:</b> Setting the curve on too low a timeframe '
        'or flip-flopping the curve on every HTF correction. The curve '
        'is stable; it shifts only on HTF CHoCH + BOS confirmation.', B))

    out.append(P('<b>13.3  Pass 2 — HTF zones</b>', H3))
    out.append(P(
        '<b>What to look for:</b> On the same HTF as Pass 1, identify '
        'all significant supply and demand zones. For each zone, '
        'assess: freshness (touches since creation), departure strength '
        '(impulsive + BOS?), and positional strength (at a major swing?). '
        'Mark the highest-quality zones as priority reaction levels.', B))
    out.append(P(
        '<b>Decision:</b> Identify the HTF zone that price is most '
        'likely to visit next (based on curve direction and current '
        'price location). This is the destination zone — the LTF '
        'analysis will look for entries inside this zone.', B))
    out.append(P(
        '<b>Common error:</b> Marking every base on the HTF as a zone. '
        'Only bases with impulsive departures and BOS qualify. Bases '
        'without departures are noise.', B))

    out.append(P('<b>13.4  Pass 3 — Liquidity map</b>', H3))
    out.append(P(
        '<b>What to look for:</b> On the HTF and one timeframe below, '
        'identify all obvious unswept swing highs (buy-side liquidity) '
        'and swing lows (sell-side liquidity). Mark each as a liquidity '
        'pool. Identify the MPL — the most significant unswept swing in '
        'the curve direction.', B))
    out.append(P(
        '<b>Decision:</b> For a long bias (bullish curve), the nearest '
        'buy-side liquidity above price is the target; the nearest '
        'sell-side liquidity below price is the IPDA\'s likely '
        'manipulation target (the IPDA may push price down to grab '
        'sell-side liquidity before rallying). Plan entries at zones '
        'between the manipulation target and the take-profit target.', B))
    out.append(P(
        '<b>Common error:</b> Treating every swing as a liquidity pool. '
        'Only obvious swings (multiple touches, long-lasting, HTF-visible) '
        'qualify.', B))

    out.append(P('<b>13.5  Pass 4 — MTF structure</b>', H3))
    out.append(P(
        '<b>What to look for:</b> Descend one timeframe at a time from '
        'the HTF to the entry timeframe. On each timeframe, identify '
        'the structure (HH/HL, LH/LL, range) and confirm alignment '
        'with the HTF curve. Identify nested zones — LTF zones inside '
        'HTF zones. Identify LTF liquidity pools that align with HTF '
        'liquidity (e.g., an H1 sell-side pool inside a Daily demand '
        'zone is a high-probability manipulation target).', B))
    out.append(P(
        '<b>Decision:</b> Identify the LTF entry zone — a fresh LTF '
        'zone nested inside the HTF destination zone, aligned with the '
        'curve. This is where the entry will be sought in Pass 6.', B))
    out.append(P(
        '<b>Common error:</b> Skipping timeframes or treating LTF '
        'structure as equal to HTF structure. Timeframe hierarchy is '
        'absolute — HTF dominates.', B))

    out.append(P('<b>13.6  Pass 5 — Pattern inventory</b>', H3))
    out.append(P(
        '<b>What to look for:</b> On the entry timeframe, identify all '
        'patterns: compressions, flags and FLs, FTR-confirmed zones, '
        'recent sweeps, engulfs at prior zone touches, QM or Diamond '
        'candidates. For each pattern, assess whether it aligns with '
        'the curve and whether it is at a decision point.', B))
    out.append(P(
        '<b>Decision:</b> Identify the highest-probability pattern in '
        'the LTF entry zone. This is the candidate setup. If no pattern '
        'is present in the entry zone, do not trade — wait for one to '
        'form.', B))
    out.append(P(
        '<b>Common error:</b> Marking patterns in no-man\'s land '
        '(outside zones, away from decision points). Patterns in '
        'no-man\'s land are 50/50 at best.', B))

    out.append(P('<b>13.7  Pass 6 — Entry refinement</b>', H3))
    out.append(P(
        '<b>What to look for:</b> Drop one timeframe below the entry '
        'timeframe (e.g., M15 if entry is on H1). Identify the precise '
        'entry trigger: an engulf, a decision candle, a sweep reversal, '
        'or a compression resolve at the LTF entry zone. Identify the '
        'stop loss (beyond the zone\'s distal line or the sweep '
        'extreme). Identify the targets (HTF liquidity pools in the '
        'curve direction).', B))
    out.append(P(
        '<b>Decision:</b> If the trigger is present, enter on its '
        'close. If not, set an alert and wait. The professional does '
        'not enter on a zone touch — they wait for the trigger.', B))
    out.append(P(
        '<b>Common error:</b> Entering on the zone touch without a '
        'trigger. The touch is the location; the trigger is the '
        'confirmation. Without the trigger, the entry is a guess.', B))

    out.append(P('<b>13.8  Worked example 1 — EURUSD H1</b>', H2))
    out.append(P(
        'The schematic below shows the six-pass protocol applied to a '
        'hypothetical EURUSD H1 chart. The chart is described in '
        'monospace ASCII; the principle matters more than the '
        'specifics.', B))
    out.append(S(1, 4))
    out.append(mono_block([
        'EURUSD H1 — SIX-PASS READING (hypothetical)',
        '',
        'Current price: 1.0890',
        '',
        'PASS 1 — CURVE (Weekly):',
        '  Structure: HH/HL since 1.0600 low. Bullish curve.',
        '  Active zone: Weekly demand at 1.0820-1.0850.',
        '  MPL: Unswept Weekly high at 1.1100.',
        '  Bias: LONG only.',
        '',
        'PASS 2 — HTF ZONES (Weekly):',
        '  Zone A: Weekly demand 1.0820-1.0850 (fresh, strong dep, BOS). Quality 9.',
        '  Zone B: Weekly supply 1.1100-1.1120 (fresh, strong dep). Quality 8.',
        '  Destination zone: A (price approaching from above).',
        '',
        'PASS 3 — LIQUIDITY MAP (Weekly + Daily):',
        '  Buy-side: 1.0940 (Daily high, unswept), 1.1100 (Weekly MPL).',
        '  Sell-side: 1.0870 (H1 Asian low), 1.0820 (Weekly zone edge).',
        '  Manipulation target: 1.0870 (sell-side below current price).',
        '  Take-profit target: 1.0940 then 1.1100.',
        '',
        'PASS 4 — MTF STRUCTURE (Weekly → Daily → H4 → H1):',
        '  Daily: HH/HL, aligned. Daily demand at 1.0860-1.0880.',
        '  H4: HL at 1.0855, aligned. H4 demand at 1.0865-1.0875 (nested in Daily).',
        '  H1: HL at 1.0870, aligned. H1 demand at 1.0868-1.0875 (nested in H4+Daily).',
        '  LTF entry zone: 1.0868-1.0875 (triple-nested).',
        '',
        'PASS 5 — PATTERN INVENTORY (H1):',
        '  Compression forming at 1.0870-1.0878 (4 candles, diminishing range).',
        '  No engulf yet (compression not resolved).',
        '  Sell-side liquidity just below at 1.0868.',
        '  Candidate setup: compression resolve OR sweep at 1.0868 + engulf.',
        '',
        'PASS 6 — ENTRY REFINEMENT (M15):',
        '  M15 compression at 1.0870-1.0878 (5 candles).',
        '  M15 sell-side pool at 1.0868.',
        '  Trigger: wait for M15 sweep of 1.0868 followed by engulf.',
        '  Entry: engulf close (expected ~1.0875).',
        '  Stop: below 1.0860 (below H1 zone distal).',
        '  Target 1: 1.0940 (Daily buy-side liquidity).',
        '  Target 2: 1.1100 (Weekly MPL).',
        '',
        'WHY CHAIN:',
        '  Weekly curve bullish → long only.',
        '  Triple-nested H1 zone → must-react.',
        '  Compression + sell-side pool → IPDA manipulation setup.',
        '  Sweep + engulf → trigger confirms reversal of manipulation.',
        '  Targets are HTF liquidity → price biased to visit.',
        '  Invalidation structural (below H1 distal) → tight risk.',
    ]))

    out.append(P('<b>13.9  Worked example 2 — BTC daily</b>', H2))
    out.append(P(
        'The schematic below shows a different setup on BTC daily, '
        'combining a QM reversal with a nested zone and an FL.', B))
    out.append(S(1, 4))
    out.append(mono_block([
        'BTC DAILY — QM + NESTED ZONE + FL (hypothetical)',
        '',
        'Current price: 62000',
        '',
        'PASS 1 — CURVE (Weekly):',
        '  Structure: LH/LL from 73k. Bearish curve.',
        '  Active zone: Weekly supply at 70000-72000.',
        '  MPL: Unswept Weekly low at 49000.',
        '  Bias: SHORT only.',
        '',
        'PASS 2 — HTF ZONES (Weekly):',
        '  Zone A: Weekly supply 70000-72000 (fresh, strong dep, BOS). Quality 9.',
        '  Zone B: Weekly demand 56000-58000 (1 touch, lightly consumed). Quality 6.',
        '  Destination zone: A (price expected to rally toward 70k).',
        '',
        'PASS 3 — LIQUIDITY MAP (Weekly + Daily):',
        '  Buy-side: 65000 (Daily high, unswept), 70000 (Weekly zone edge).',
        '  Sell-side: 60000 (recent Daily low, unswept).',
        '  Manipulation target: 65000 then 70000.',
        '  Take-profit target: 58000 (Weekly demand edge), then 49000 (MPL).',
        '',
        'PASS 4 — MTF STRUCTURE:',
        '  Daily: LH/LL, aligned with Weekly bearish.',
        '  Daily supply at 64000-65000 (fresh, nested below Weekly supply).',
        '  H4 supply at 64500-64800 (nested in Daily).',
        '  LTF entry zone: 64500-64800 (triple-nested supply).',
        '',
        'PASS 5 — PATTERN INVENTORY (Daily):',
        '  QM forming: LH at 60000, head at 65000 (sweep of buy-side liquidity),',
        '             CHoCH on close below 60000 (after the head),',
        '             return to shoulder (60000) = FL of recent flag.',
        '  Candidate: QM short on return to 65000 (shoulder) OR at 64500-64800 (nested zone).',
        '',
        'PASS 6 — ENTRY REFINEMENT (H4):',
        '  H4 compression at 64800-65000 (5 candles).',
        '  Trigger: H4 engulf close below 64800.',
        '  Entry: ~64750.',
        '  Stop: above 65100 (above QM head + nested zone distal).',
        '  Target 1: 60000 (QM measured move + Daily liquidity).',
        '  Target 2: 58000 (Weekly demand edge).',
        '  Target 3: 49000 (Weekly MPL).',
        '',
        'WHY CHAIN:',
        '  Weekly curve bearish → short only.',
        '  QM head at 65000 = sweep of Daily buy-side liquidity → manipulation complete.',
        '  QM shoulder return to 65000 = FL of recent flag → must-react.',
        '  Triple-nested supply at 64500-64800 → must-react inside must-react.',
        '  H4 engulf = trigger confirms IPDA commitment.',
        '  Targets are HTF liquidity → price biased to visit.',
    ]))

    out.append(P('<b>13.10  Common bad habits</b>', H2))
    out.append(P(
        'The six-pass protocol exists because most traders fail at one '
        'or more of the following bad habits. The future engine must '
        'be designed to refuse to produce a signal if any of these '
        'habits are detected in its own reasoning.', B))
    out.append(S(1, 6))
    out.extend(numbered_list([
        '<b>Annotating mechanically.</b> Marking every base, every swing, every wick as a structure. This produces a chart covered in marks and no thesis. The professional marks only significant structures — the ones that would change the trade plan.',
        '<b>Looking for trades first.</b> Opening the chart and asking "where can I enter?" This biases the read toward finding entries and away from understanding the story. The professional asks "what is the story?" first; the entry emerges from the story.',
        '<b>Ignoring the curve.</b> Skipping Pass 1 because the LTF setup looks good. The LTF setup is irrelevant if it is against the curve — the HTF institution will absorb it.',
        '<b>Bottom-up reading.</b> Starting at the LTF and trying to retrofit HTF context. This always produces a misread; the LTF cannot define the HTF context.',
        '<b>Flip-flopping the curve.</b> Changing the curve read on every HTF correction. The curve is stable; it shifts only on HTF CHoCH + BOS confirmation.',
        '<b>Entering on the touch.</b> Entering at a zone touch without waiting for the trigger. The touch is the location; the trigger is the confirmation. Without the trigger, the entry is a guess.',
        '<b>Skipping the liquidity map.</b> Not identifying liquidity targets before entering. Without a target, there is no trade plan; without a manipulation target, there is no anticipation of the IPDA\'s next move.',
    ]))
    return out


def ch14_reasoning_templates(h):
    """Chapter 14 — Reasoning Dataset Templates."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    std_table, TBL_HEADER, TBL_CELL, TBL_CELL_BOLD = (
        h['std_table'], h['TBL_HEADER'], h['TBL_CELL'], h['TBL_CELL_BOLD'])
    mono_block = h['mono_block']

    out.append(P(
        '<i>The reasoning dataset is the heart of this volume. Every '
        'concept, every graph edge, every failure mode exists to feed '
        'the WHY chain. A trader who can produce the chain is a '
        'professional; a trader who cannot is a pattern-mechanic.</i>',
        h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>14.1  The master WHY-question list</b>', H2))
    out.append(P(
        'The professional RTM trader answers a fixed set of WHY '
        'questions for every chart. The questions are not optional — '
        'each one must be answered before a trade is taken. The future '
        'engine must answer each question as part of its reasoning '
        'output; a signal that cannot answer all of them must not be '
        'issued.', B))
    out.append(S(1, 6))

    why_data = [[
        P('#', TBL_HEADER),
        P('WHY question', TBL_HEADER),
        P('Required context', TBL_HEADER),
        P('Acceptable answer shape', TBL_HEADER),
        P('Red flags', TBL_HEADER),
    ]]
    questions = [
        ('1', 'Why did price leave the base?',
         'The base, the departure candle, the structure at the time.',
         'Institutional aggression after accumulation/distribution; the institution became the dominant aggressor.',
         'No BOS; weak departure body; no clear institutional reason.'),
        ('2', 'Why did price stop at this level?',
         'The level, the structure, the prior history at this level.',
         'Unfilled institutional inventory rests here; the level is a zone, a swing, or an FL.',
         'No structural reason; level is in no-man\'s land; level is a round number only.'),
        ('3', 'Why did liquidity form here?',
         'The swing, the obviousness, the timeframe.',
         'Obvious swing attracts retail stops; the more obvious, the more liquidity.',
         'Swing is not obvious; swing has been swept; liquidity is LTF only.'),
        ('4', 'Why did compression appear?',
         'The location, the prior move, the institutional context.',
         'Institutional absorption at a zone or FL; accumulation/distribution in progress.',
         'Compression in no-man\'s land; compression without prior impulse; compression >20 candles.'),
        ('5', 'Why did the zone fail?',
         'The zone, the approach, the HTF context.',
         'Curve misalignment, weak departure, no liquidity target, consumed, or HTF shift.',
         'No reason identified; "it just failed"; failure not on HTF.'),
        ('6', 'Why did the engulf succeed?',
         'The engulf, the location, the prior sweep, the curve.',
         'Institutional commitment after a liquidity event, at a fresh zone, aligned with curve.',
         'No prior sweep; engulf in no-man\'s land; counter-curve; weak body.'),
        ('7', 'Why is this zone fresh?',
         'The zone creation date, the price action since, the touches.',
         'No candle has returned to the zone since creation; full unfilled inventory remains.',
         'Touches on lower timeframe; wick touches; long time elapsed.'),
        ('8', 'Why is this zone nested?',
         'The LTF zone, the HTF zone, the price band overlap.',
         'LTF zone\'s price band falls inside HTF zone\'s price band; multi-timeframe confluence.',
         'Zones are adjacent not overlapping; same zone on multiple TFs counted twice.'),
        ('9', 'Why is the curve bullish/bearish?',
         'The HTF structure, the active zone, the price location.',
         'HH/HL (or LH/LL) on HTF, price above demand (or below supply), HTF zone intact.',
         'Curve set on LTF; curve flip-flopping; curve against HTF structure.'),
        ('10', 'Why is the IPDA likely to visit this liquidity pool?',
         'The pool, the curve direction, the institutional need.',
         'Pool is in the curve direction; IPDA needs liquidity to fill a large order; pool is unswept and obvious.',
         'Pool is swept; pool is against curve; pool is LTF only.'),
        ('11', 'Why is the sweep a reversal signal (not continuation)?',
         'The sweep, the immediate reaction, the CHoCH, the curve.',
         'Immediate reversal with engulf + CHoCH + curve alignment.',
         'No immediate reversal; no CHoCH; counter-curve sweep.'),
        ('12', 'Why is this QM valid (not a fake)?',
         'The five QM components, the curve, the liquidity at the head.',
         'All five components present; head is a sweep of real liquidity; CHoCH confirms; curve aligned.',
         'Missing components; head not a sweep; no CHoCH; counter-curve.'),
        ('13', 'Why hold this trade (not exit early)?',
         'The entry, the departure, the structure, the target.',
         'Departure strong; structure intact; target is HTF liquidity; no failure signs.',
         'Weak departure; structure breaking; no clear target; failure signs present.'),
        ('14', 'Why exit this trade now?',
         'The price action, the failure signs, the target reached.',
         'Target reached (HTF liquidity swept); failure sign appeared (weak departure, CHoCH against, zone broken).',
         'Exit on arbitrary level; exit on fear; exit without structural reason.'),
        ('15', 'Why is the invalidation level here (not wider)?',
         'The zone distal line, the sweep extreme, the structure.',
         'Invalidation is structural — beyond the zone distal, beyond the sweep extreme, beyond the defining swing.',
         'Invalidation is arbitrary; invalidation is "wider for safety"; invalidation is not structural.'),
    ]
    for n, q, ctx, ans, red in questions:
        why_data.append([
            P(n, TBL_CELL_BOLD), P(q, TBL_CELL_BOLD),
            P(ctx, TBL_CELL), P(ans, TBL_CELL), P(red, TBL_CELL),
        ])
    out.extend(std_table(
        why_data,
        col_ratios=[0.04, 0.20, 0.22, 0.30, 0.24],
        caption_text='Table 14.1 — The master WHY-question list. Every trade must answer all 15.'
    ))

    out.append(P('<b>14.2  Template format</b>', H2))
    out.append(P(
        'Each reasoning entry in the dataset follows a fixed template. '
        'The template is rigid — incomplete entries are rejected. The '
        'future engine should output exactly this format for every '
        'signal.', B))
    out.append(S(1, 4))
    out.append(mono_block([
        'REASONING ENTRY TEMPLATE',
        '',
        'INSTRUMENT: <symbol>',
        'TIMEFRAME: <entry TF>',
        'DATE/TIME: <observation time>',
        '',
        'CURVE: <bullish/bearish/neutral> on <HTF>. Reason: <HTF structure + active zone>.',
        '',
        'CANDIDATE SETUP: <pattern> at <zone> on <TF>.',
        '',
        'WHY CHAIN:',
        '  Q1 (Why did price leave?): <answer>',
        '  Q2 (Why did price stop?):  <answer>',
        '  Q3 (Why did liquidity form?): <answer>',
        '  Q4 (Why did compression appear?): <answer> (if applicable)',
        '  Q5 (Why did the zone fail?) — N/A or <answer>',
        '  Q6 (Why did the engulf succeed?): <answer> (if applicable)',
        '  Q7 (Why is this zone fresh?): <answer>',
        '  Q8 (Why is this zone nested?): <answer>',
        '  Q9 (Why is the curve <direction>?): <answer>',
        '  Q10 (Why will IPDA visit <target>?): <answer>',
        '  Q11 (Why is the sweep a reversal?): <answer> (if applicable)',
        '  Q12 (Why is the QM valid?): <answer> (if applicable)',
        '',
        'ENTRY PLAN:',
        '  Entry: <price> on <trigger>',
        '  Stop: <price> (structural reason: <reason>)',
        '  Target 1: <price> (HTF liquidity: <pool>)',
        '  Target 2: <price> (HTF liquidity: <pool>)',
        '  Risk:Reward: <ratio>',
        '',
        'INVALIDATION:',
        '  Primary: <structural condition>',
        '  Secondary: <structural condition>',
        '',
        'FAILURE MONITORING:',
        '  Watch for: <list of failure signs from Chapter 12>',
        '  Exit if: <list of conditions>',
    ]))

    out.append(P('<b>14.3  Worked example 1 — bullish FTR continuation</b>', H2))
    out.append(mono_block([
        'INSTRUMENT: EURUSD',
        'TIMEFRAME: H1',
        'DATE/TIME: 2025-XX-XX 14:00 UTC',
        '',
        'CURVE: Bullish on Weekly. Reason: Weekly HH/HL structure, price above',
        '  Weekly demand at 1.0800-1.0850, last weekly HL held at 1.0820.',
        '',
        'CANDIDATE SETUP: Long at H1 demand zone 1.0870-1.0875 (nested in H4',
        '  demand 1.0860-1.0880, nested in Daily demand 1.0850-1.0890).',
        '',
        'WHY CHAIN:',
        '  Q1 (Why did price leave?): Price left the H1 base at 1.0870-1.0875',
        '     because an institution completed accumulation and became the',
        '     dominant aggressor, firing an impulsive departure to 1.0920 with',
        '     BOS (broke prior H1 swing at 1.0895).',
        '  Q2 (Why did price stop?): Price stopped at 1.0920 because there was',
        '     a prior H1 supply zone there (consumed) + buy-side liquidity',
        '     above the prior H1 high at 1.0925. The IPDA swept 1.0925 and',
        '     reversed.',
        '  Q3 (Why did liquidity form at 1.0925?): Retail longs placed stops',
        '     above the obvious H1 swing high at 1.0920-1.0925 (multi-touch,',
        '     visible on H4). The obviousness attracted the stops.',
        '  Q4 (Why did compression appear at 1.0870?): Before the departure,',
        '     price compressed at 1.0870-1.0875 for 5 candles with diminishing',
        '     range. This was institutional accumulation — absorbing sell-side',
        '     flow without committing directionally.',
        '  Q5 (Why did the zone fail?) — N/A. Zone has not been touched yet.',
        '  Q6 (Why did the engulf succeed?): The engulf at 1.0875 (after the',
        '     compression) succeeded because it was preceded by accumulation',
        '     (the compression), aligned with the Weekly curve, broke structure',
        '     on H1, and targeted the buy-side liquidity at 1.0925.',
        '  Q7 (Why is the zone fresh?): Since the base+departure 2 days ago,',
        '     price has not returned to 1.0870-1.0875. The unfilled inventory',
        '     is intact.',
        '  Q8 (Why is the zone nested?): The H1 zone at 1.0870-1.0875 falls',
        '     inside the H4 demand at 1.0860-1.0880, which falls inside the',
        '     Daily demand at 1.0850-1.0890. Three-timeframe nesting.',
        '  Q9 (Why is the curve bullish?): Weekly structure is HH/HL since',
        '     1.0600; price is above the Weekly demand; the Weekly demand',
        '     held on the last test. All three confirm bullish curve.',
        '  Q10 (Why will IPDA visit 1.1100?): 1.1100 is the unswept Weekly',
        '     high (MPL). The bullish curve means the IPDA is building a',
        '     long; to fill remaining sell orders it will push price up to',
        '     the buy-side liquidity at 1.1100. The IPDA visits pools in the',
        '     curve direction.',
        '',
        'ENTRY PLAN:',
        '  Entry: 1.0872 on engulf close (after the sweep of 1.0868 sell-side pool).',
        '  Stop: 1.0855 (below H1 zone distal line at 1.0870 and below H4 zone',
        '     proximal at 1.0860 — structural invalidation).',
        '  Target 1: 1.0940 (Daily buy-side liquidity, unswept).',
        '  Target 2: 1.1100 (Weekly MPL).',
        '  Risk:Reward: 1:3.5 to Target 1; 1:13.5 to Target 2.',
        '',
        'INVALIDATION:',
        '  Primary: H1 close below 1.0870 (zone distal broken).',
        '  Secondary: H4 close below 1.0860 (H4 zone proximal broken).',
        '',
        'FAILURE MONITORING:',
        '  Watch for: weak departure on first candle after entry (engulf <60%',
        '     body or close in mid-range); CHoCH on H1 (close below prior HL);',
        '     HTF curve shift (Weekly CHoCH — extremely unlikely intraday).',
        '  Exit if: H1 close below entry candle open; H1 close below 1.0870;',
        '     weak departure confirmed by 2 candles.',
    ]))

    out.append(P('<b>14.4  Worked example 2 — bearish QM reversal after liquidity sweep</b>', H2))
    out.append(P(
        'See Chapter 15 case 2 for the full reasoning entry. The '
        'structure is identical to example 1; only the direction and '
        'pattern differ.', B))

    out.append(P('<b>14.5  Worked example 3 — failed zone (consumed without reaction)</b>', H2))
    out.append(P(
        'See Chapter 15 case 7 for the full reasoning entry. This '
        'example shows the WHY chain applied to a failure — the same '
        'questions are answered, but the answers reveal why the trade '
        'should NOT be taken. Reasoning about failures is as important '
        'as reasoning about successes.', B))
    return out


def ch15_reasoning_cases(h):
    """Chapter 15 — Reasoning Dataset: Worked Examples."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    mono_block = h['mono_block']

    out.append(P(
        '<i>Eight additional worked reasoning case studies. Each case '
        'is a complete reasoning entry in the template of Chapter 14. '
        'Together with the three examples in Chapter 14, these 11 cases '
        'form the initial reasoning dataset for the future engine.</i>',
        h['BODY_LEAD']))
    out.append(S(1, 10))

    cases = [
        ('Case 1 — Nested H1+M15 demand zone hold',
         [
             'INSTRUMENT: GBPUSD  |  TF: M15  |  CURVE: Bullish (Daily)',
             '',
             'SETUP: Long at M15 demand 1.2670-1.2675 (nested in H1 demand',
             '  1.2665-1.2680, nested in H4 demand 1.2650-1.2690).',
             '',
             'CONTEXT:',
             '  Daily curve bullish (HH/HL, last Daily HL at 1.2620 held).',
             '  H4 structure bullish, H4 demand at 1.2650-1.2690 fresh.',
             '  H1 structure bullish, H1 demand at 1.2665-1.2680 fresh.',
             '  M15 structure: HL at 1.2668 (inside H1 demand).',
             '',
             'WHY CHAIN:',
             '  Price left the M15 base at 1.2670-1.2675 because an institution',
             '  completed accumulation and fired an impulsive departure to',
             '  1.2710 with BOS (broke prior M15 swing at 1.2695).',
             '  Price stopped at 1.2710 because there was H1 supply there',
             '  (consumed) + buy-side liquidity above prior M15 high at 1.2715.',
             '  Liquidity at 1.2715 formed because retail longs placed stops',
             '  above the obvious M15 swing high (multi-touch, visible on H1).',
             '  Compression appeared at 1.2670-1.2675 because the institution',
             '  was absorbing sell-side flow without committing directionally.',
             '  The zone is fresh because no candle has returned to 1.2670-1.2675',
             '  since the departure 4 hours ago.',
             '  The zone is nested because M15 demand falls inside H1 demand',
             '  which falls inside H4 demand.',
             '  The curve is bullish because Daily HH/HL and price above Daily',
             '  demand.',
             '  The IPDA will visit 1.2780 (Daily buy-side liquidity, unswept)',
             '  because the curve is bullish and the IPDA targets liquidity in',
             '  the curve direction.',
             '',
             'ENTRY REASONING:',
             '  M15 swept sell-side pool at 1.2668 (Asian low), reversed with',
             '  M15 engulf: open 1.2672, close 1.2690, body 90%, broke prior',
             '  M15 swing at 1.2685. Enter long on engulf close at 1.2690.',
             '  Stop: 1.2660 (below M15 sweep extreme and below H1 zone distal).',
             '  Target 1: 1.2715 (M15 buy-side liquidity, swept or not).',
             '  Target 2: 1.2780 (Daily buy-side liquidity).',
             '',
             'FAILURE CONDITIONS TO MONITOR:',
             '  Weak departure on first candle after entry; M15 close below',
             '  1.2670 (zone distal); H1 close below 1.2665 (H1 zone distal);',
             '  H4 CHoCH (close below H4 HL at 1.2620).',
         ]),
        ('Case 2 — Bearish QM reversal after liquidity sweep',
         [
             'INSTRUMENT: EURUSD  |  TF: H1  |  CURVE: Bearish (H4)',
             '',
             'SETUP: Short on QM shoulder return at 1.0940.',
             '',
             'CONTEXT:',
             '  H4 curve bearish (LH/LL from 1.1100). H4 supply at 1.0940-1.0960',
             '  fresh. H1 structure was bullish (counter-trend) into the QM head.',
             '  H1 LH at 1.0920 (left shoulder).',
             '  H1 head at 1.0950 (sweep of buy-side liquidity above 1.0940 =',
             '  H4 supply edge + obvious H1 swing high).',
             '  H1 CHoCH: close below 1.0900 (last H1 HL).',
             '  H1 BOS: close below 1.0880.',
             '  Retracement to 1.0940 (shoulder) expected.',
             '',
             'WHY CHAIN:',
             '  The head at 1.0950 was a sweep of buy-side liquidity: obvious H1',
             '  swing high + H4 supply edge, multi-touch, retail stops above.',
             '  The IPDA pushed to 1.0950 to fill sell orders against the buy',
             '  stops, then reversed. The reversal was the true bearish move',
             '  (aligned with H4 curve).',
             '  CHoCH at 1.0900 confirmed the intent shift. BOS at 1.0880',
             '  confirmed the reversal. The QM is valid.',
             '  The shoulder return to 1.0940 is the entry: it is also the H4',
             '  supply edge, so it is a must-react level (QM shoulder + H4 zone',
             '  + prior H1 LH).',
             '',
             'ENTRY REASONING:',
             '  Enter short on H1 engulf close at 1.0940 (or on rejection wick',
             '  if no engulf forms).',
             '  Stop: 1.0955 (above QM head + above H4 zone distal).',
             '  Target 1: 1.0880 (H1 BOS level, prior structure).',
             '  Target 2: 1.0820 (H4 demand edge).',
             '  Target 3: 1.0700 (Weekly demand, MPL).',
             '',
             'FAILURE CONDITIONS TO MONITOR:',
             '  H1 close above 1.0950 (QM head) — invalidates QM. H4 close above',
             '  1.0960 (H4 zone distal) — invalidates H4 supply. Weak reaction',
             '  at 1.0940 (grind through instead of rejection) — exit at 1.0950.',
         ]),
        ('Case 3 — FL sweep + immediate rejection',
         [
             'INSTRUMENT: ES (S&P 500 futures)  |  TF: H1  |  CURVE: Bullish (Daily)',
             '',
             'SETUP: Long at H1 FL 4500 after sweep.',
             '',
             'CONTEXT:',
             '  Daily curve bullish. H1 impulse from 4480 to 4540. H1 flag to',
             '  4500 (FL at 4500, 38% retracement). H1 resumed up to 4570.',
             '  Three weeks later, price retraces to 4500 again. Sell-side',
             '  liquidity has formed just below at 4498 (Asian session low).',
             '',
             'WHY CHAIN:',
             '  The FL at 4500 is significant because it was the deepest point',
             '  of a flag in a Daily-aligned trend. The institutional absorption',
             '  was strongest there; orders rest there.',
             '  Price is returning to 4500 because the IPDA is seeking sell-side',
             '  liquidity (the Asian low at 4498). The IPDA will sweep 4498 and',
             '  reverse to continue the bullish move (Daily curve).',
             '  The sweep at 4498 + reversal at 4500 (FL) is a high-probability',
             '  long setup: liquidity event + FL reaction + curve alignment.',
             '',
             'ENTRY REASONING:',
             '  Wait for H1 sweep of 4498 with immediate reversal (engulf or',
             '  strong bullish candle). Enter long on the engulf close.',
             '  Stop: 4490 (below sweep extreme, below FL).',
             '  Target 1: 4540 (prior H1 high, buy-side liquidity).',
             '  Target 2: 4570 (prior H1 high, buy-side liquidity).',
             '  Target 3: 4600 (Daily MPL, round number + obvious).',
             '',
             'FAILURE CONDITIONS TO MONITOR:',
             '  H1 close below 4490 (FL broken); weak reversal (no engulf); H4',
             '  CHoCH (close below H4 HL).',
         ]),
        ('Case 4 — Diamond top after extended impulse',
         [
             'INSTRUMENT: NAS100  |  TF: H4  |  CURVE: Bearish (Daily)',
             '',
             'SETUP: Short on Diamond break.',
             '',
             'CONTEXT:',
             '  Daily curve bearish. H4 extended uptrend (counter-trend rally)',
             '  from 15600 to 15900. H4 diamond: 7 candles of symmetric',
             '  consolidation 15850-15900. H4 break below 15850 with engulf.',
             '',
             'WHY CHAIN:',
             '  The extended uptrend was a counter-trend rally inside a Daily',
             '  bearish curve. The institution that drove the rally was',
             '  distributing into the latecomers.',
             '  The diamond at 15850-15900 was the distribution phase: symmetric',
             '  consolidation as the institution absorbed buy-side flow without',
             '  committing to higher prices.',
             '  The break below 15850 with engulf is the deployment phase: the',
             '  institution has finished distributing and is now committing to',
             '  the bearish direction (aligned with Daily curve).',
             '  The diamond is valid because: prior extended trend (the rally),',
             '  symmetric consolidation (the diamond), strong reversal break',
             '  (the engulf), and curve alignment (Daily bearish).',
             '',
             'ENTRY REASONING:',
             '  Enter short on H4 engulf close below 15850.',
             '  Stop: 15910 (above diamond high).',
             '  Target 1: 15600 (prior H4 low, sell-side liquidity).',
             '  Target 2: 15400 (Daily demand edge).',
             '',
             'FAILURE CONDITIONS TO MONITOR:',
             '  H4 close above 15900 (diamond high) — diamond invalid. Weak',
             '  break (no engulf) — wait for confirmation. Daily CHoCH',
             '  (close above Daily LH) — curve shift, exit.',
         ]),
        ('Case 5 — BSZ engineering before NFP',
         [
             'INSTRUMENT: EURUSD  |  TF: H1  |  CURVE: Bullish (Daily)',
             '',
             'SETUP: Long at BSZ (Buy-Side Zone) sweep reversal.',
             '',
             'CONTEXT:',
             '  Daily curve bullish. NFP in 2 hours. Obvious H1 swing high at',
             '  1.0940 (BSZ — buy-side liquidity). Sell-side liquidity at 1.0890',
             '  (Asian low). Current price 1.0920.',
             '',
             'WHY CHAIN:',
             '  Before NFP, liquidity is concentrated at obvious levels. The H1',
             '  swing high at 1.0940 is obvious (multi-touch, visible on H4) —',
             '  significant buy-side liquidity sits above.',
             '  The Asian low at 1.0890 is also obvious — sell-side liquidity',
             '  sits below.',
             '  The IPDA is likely to engineer a sweep of one or both pools',
             '  around NFP. With Daily curve bullish, the higher-probability',
             '  scenario is: sweep sell-side (1.0890) first to accumulate, then',
             '  rally to sweep buy-side (1.0940) to distribute into the buy',
             '  stops. Or: sweep buy-side (1.0940) first as a stop hunt, then',
             '  continue bullish.',
             '  The professional waits for the sweep, then enters on the',
             '  reversal in the curve direction.',
             '',
             'ENTRY REASONING:',
             '  Scenario A: price sweeps 1.0890 (sell-side), reverses with',
             '     engulf. Enter long on engulf close. Stop below 1.0885.',
             '     Target 1.0940 (buy-side), target 1.0980 (H4 liquidity).',
             '  Scenario B: price sweeps 1.0940 (buy-side), reverses with',
             '     engulf. Do NOT enter short (counter-curve). Wait for',
             '     re-entry long on pullback to 1.0920 (prior H1 LH).',
             '  Default: do not enter before the sweep. The sweep is the',
             '     trigger; without it, no entry.',
             '',
             'FAILURE CONDITIONS TO MONITOR:',
             '  No sweep occurs (price ranges through NFP) — no trade. Sweep',
             '  occurs but no immediate reversal — sweep was real continuation,',
             '  exit on close beyond sweep extreme. Daily CHoCH — curve shift,',
             '  re-evaluate.',
         ]),
        ('Case 6 — QM continuation in trend',
         [
             'INSTRUMENT: GBPJPY  |  TF: H4  |  CURVE: Bullish (Weekly)',
             '',
             'SETUP: Long on bullish QM (continuation in trend).',
             '',
             'CONTEXT:',
             '  Weekly curve bullish. H4 structure bullish. H4 HL at 192.00',
             '  (left shoulder). H4 LL at 191.00 (head — sweep of sell-side',
             '  liquidity below prior H4 swing low at 192.00). H4 CHoCH: close',
             '  above 192.50. H4 BOS: close above 193.00. Retracement to 192.00',
             '  (shoulder).',
             '',
             'WHY CHAIN:',
             '  The head at 191.00 was a sweep of sell-side liquidity: prior H4',
             '  swing low at 192.00 was obvious, retail stops below. The IPDA',
             '  pushed to 191.00 to fill buy orders against the sell stops, then',
             '  reversed to continue the bullish move (Weekly curve).',
             '  CHoCH at 192.50 confirmed intent shift (from down to up). BOS',
             '  at 193.00 confirmed the reversal. QM is valid.',
             '  The shoulder return to 192.00 is the entry: it is also a prior',
             '  H4 swing low (positional strength) and aligns with the Weekly',
             '  curve. Must-react level.',
             '',
             'ENTRY REASONING:',
             '  Enter long on H4 engulf close at 192.00 (or on rejection wick',
             '  with confirmed bullish structure).',
             '  Stop: 190.90 (below QM head).',
             '  Target 1: 194.00 (prior H4 high, buy-side liquidity).',
             '  Target 2: 196.00 (Weekly MPL).',
             '',
             'FAILURE CONDITIONS TO MONITOR:',
             '  H4 close below 191.00 (QM head) — invalidates QM. Weak reaction',
             '  at 192.00 — exit at 191.50. Weekly CHoCH — curve shift, exit.',
         ]),
        ('Case 7 — MPL rejection',
         [
             'INSTRUMENT: EURUSD  |  TF: H1  |  CURVE: Bullish (Weekly)',
             '',
             'SETUP: Take profit on long at MPL; potential short reversal.',
             '',
             'CONTEXT:',
             '  Weekly curve bullish. Weekly MPL at 1.1100 (unswept Weekly high',
             '  from 4 months ago). Long entered at 1.0870 (H1 demand), target',
             '  1.1100. Price has reached 1.1095.',
             '',
             'WHY CHAIN:',
             '  The MPL at 1.1100 is the highest-probability reaction level on',
             '  the chart. It is the unswept Weekly high; buy-side liquidity',
             '  has accumulated above it for 4 months.',
             '  The IPDA is biased to visit the MPL because it is in the curve',
             '  direction (bullish) and contains the largest pool of buy-side',
             '  liquidity.',
             '  At the MPL, the IPDA will sweep 1.1100-1.1110 (fill sell orders',
             '  against the buy stops) and then likely reverse. The reversal',
             '  probability is high because the MPL is the largest pool — once',
             '  swept, the next target is far below.',
             '',
             'ENTRY REASONING (for the long exit):',
             '  Exit the long at 1.1095 (just below the MPL) — do not chase the',
             '  sweep. The sweep may not happen today; the long has reached its',
             '  target.',
             '',
             'ENTRY REASONING (for the potential short reversal):',
             '  If H1 sweeps 1.1110 and reverses with engulf + CHoCH, enter',
             '  short on the engulf close.',
             '  Stop: 1.1120 (above sweep extreme).',
             '  Target 1: 1.0940 (prior H1 high, now sell-side liquidity below).',
             '  Target 2: 1.0870 (prior H1 demand, now consumed — minor target).',
             '',
             'FAILURE CONDITIONS TO MONITOR:',
             '  No sweep at 1.1100 — no short entry. Sweep but no reversal —',
             '  continuation to next MPL (rare). Weekly CHoCH below prior Weekly',
             '  HL — curve shift, treat short as higher-probability.',
         ]),
        ('Case 8 — Curve shift invalidation',
         [
             'INSTRUMENT: GBPUSD  |  TF: H1  |  CURVE: Was bullish (Daily) → shifted bearish',
             '',
             'SETUP: Long invalidated by Daily CHoCH; reverse to short.',
             '',
             'CONTEXT:',
             '  Daily curve was bullish. Long entered at H1 demand 1.2680, stop',
             '  below 1.2660, target 1.2780 (Daily MPL). Price dropped from',
             '  1.2700 to 1.2650, sweeping the H1 demand and closing below',
             '  1.2660. Daily candle then closed below the prior Daily HL at',
             '  1.2670 — Daily CHoCH.',
             '',
             'WHY CHAIN:',
             '  The long is invalidated: H1 close below 1.2660 (zone distal',
             '  broken). Exit at 1.2660 — do not "give it room".',
             '  The Daily CHoCH (close below 1.2670) invalidates the bullish',
             '  curve. The Weekly structure is still bullish, but Daily has',
             '  shifted. Timeframe hierarchy: Daily dominates H1, so H1 longs',
             '  are no longer valid.',
             '  The shift implies the institution that was driving the bullish',
             '  move has finished or reversed. New institutional intent is',
             '  bearish on Daily. The H1 demand zone is now consumed; the next',
             '  likely target is the H1 sell-side liquidity below (1.2600) and',
             '  then the Daily demand at 1.2500.',
             '',
             'ENTRY REASONING (reverse to short):',
             '  Wait for H1 retracement to 1.2680-1.2700 (the broken H1 demand,',
             '  now resistance). Enter short on H1 engulf close.',
             '  Stop: 1.2710 (above the broken zone + above prior H1 LH).',
             '  Target 1: 1.2600 (H1 sell-side liquidity).',
             '  Target 2: 1.2500 (Daily demand edge).',
             '',
             'FAILURE CONDITIONS TO MONITOR:',
             '  H1 close above 1.2710 — Daily CHoCH may have been fake; re-',
             '  evaluate. Weekly CHoCH (close below Weekly HL) — full curve',
             '  shift to bearish; larger short opportunity.',
             '',
             'LESSON:',
             '  When the HTF curve shifts, all LTF trades aligned with the old',
             '  curve are invalid. Exit immediately; do not hope. Reverse',
             '  direction only after a complete retracement + new trigger in',
             '  the new curve direction. Do not "average down" — the institution',
             '  has reversed; you should too.',
         ]),
    ]

    for title, lines in cases:
        out.append(P(f'<b>{title}</b>', H2))
        out.append(mono_block(lines))
        out.append(S(1, 8))

    out.append(P(
        'These 8 cases, combined with the 3 examples in Chapter 14, '
        'form the initial reasoning dataset. The future engine should '
        'be trained on these 11 cases as the gold standard for WHY '
        'chain output. Each case demonstrates a different combination '
        'of concepts from the knowledge graph — together they exercise '
        'most of the edges in the graph. The engine should be able to '
        'reproduce the WHY chain for each case given only the chart '
        'data, and should reject any signal whose WHY chain does not '
        'meet the standard of these examples.', B))
    return out


def ch16_probability_matrix(h):
    """Chapter 16 — Probability Contribution Matrix."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    std_table, TBL_HEADER, TBL_CELL, TBL_CELL_BOLD = (
        h['std_table'], h['TBL_HEADER'], h['TBL_CELL'], h['TBL_CELL_BOLD'])

    out.append(P(
        '<i>The probability matrix is the quantitative heart of the '
        'knowledge base. It tells the future engine how much each '
        'concept lifts the base rate, and how to combine concepts '
        'without overcounting.</i>', h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>16.1  How to read the matrix</b>', H2))
    out.append(P(
        'The matrix lists every RTM concept with four numbers: '
        'standalone probability lift (how much the concept alone '
        'improves the base rate), best confluence partners (the 2-3 '
        'concepts that most amplify it), probability lift when '
        'confirmed (the lift when best partners are also present), and '
        'failure probability when isolated (the probability of failure '
        'when the concept is present alone, without confluence).', B))
    out.append(P(
        'All numbers are practitioner estimates, not statistical claims. '
        'They encode relative importance and relative confluence '
        'strength — the future engine should treat them as priors to '
        'be refined by backtesting, not as ground truth. The base rate '
        '(no concepts present) is assumed to be 50% — a coin flip — '
        'representing the null hypothesis that a random entry has no '
        'edge.', B))

    out.append(P('<b>16.2  The matrix</b>', H2))
    matrix_data = [[
        P('Concept', TBL_HEADER),
        P('Standalone lift', TBL_HEADER),
        P('Best confluence partners', TBL_HEADER),
        P('Lift when confirmed', TBL_HEADER),
        P('Failure prob (isolated)', TBL_HEADER),
    ]]
    rows = [
        ('Curve alignment', '+20%', 'Fresh zone, FTR, Nested zones', '+35%', '30% (counter-curve)'),
        ('Fresh zone', '+10%', 'Curve, FTR, Nested zones', '+30%', '40%'),
        ('FTR confirmation', '+15%', 'Curve, Fresh zone, Strong departure', '+30%', '35%'),
        ('Strong departure (BOS)', '+12%', 'Curve, Fresh zone, FTR', '+28%', '40%'),
        ('Nested zones (3+ TF)', '+22%', 'Curve, Fresh zone, Decision point', '+40%', '30%'),
        ('Decision point (3+ structures)', '+20%', 'Curve, Fresh zone, Nested zones', '+38%', '35%'),
        ('Engulf at zone', '+12%', 'Curve, Fresh zone, Decision point', '+28%', '45%'),
        ('Sweep + reversal', '+15%', 'Curve, CHoCH, Decision point', '+30%', '40%'),
        ('QM (valid, curve-aligned)', '+18%', 'Sweep, CHoCH, Curve, Nested at shoulder', '+35%', '30%'),
        ('Diamond (valid, curve-aligned)', '+15%', 'Compression, Curve, Decision point', '+30%', '35%'),
        ('Flag Limit reaction', '+10%', 'Curve, Fresh zone, Decision point', '+25%', '45%'),
        ('Compression resolve', '+8%', 'Curve, Engulf, Zone', '+22%', '50%'),
        ('MPL as target', '+10% (hit rate)', 'Curve, Zone, Nested zones', '+20% (hit rate)', 'N/A'),
        ('CHoCH (early reversal signal)', '+5%', 'Sweep, Curve, BOS confirmation', '+20%', '50%'),
        ('BOS (trend confirmation)', '+10%', 'Curve, Impulse, Fresh zone', '+20%', '40%'),
        ('Multi-Timeframe alignment', '+15%', 'Curve, Nested zones, Decision point', '+30%', '30%'),
        ('Zone Quality 9-10', '+20%', 'All dimensions 2/2', '+25%', '25%'),
        ('Zone Quality 0-4', '-15%', 'N/A', '-15%', '65%'),
        ('Counter-curve trade', '-25%', 'N/A', '-25%', '70%'),
        ('Consumed zone (3+ touches)', '-25%', 'N/A', '-25%', '65%'),
    ]
    for c, sl, bp, lc, fp in rows:
        matrix_data.append([
            P(c, TBL_CELL_BOLD),
            P(sl, TBL_CELL),
            P(bp, TBL_CELL),
            P(lc, TBL_CELL),
            P(fp, TBL_CELL),
        ])
    out.extend(std_table(
        matrix_data,
        col_ratios=[0.22, 0.13, 0.27, 0.15, 0.23],
        caption_text='Table 16.1 — Probability contribution matrix. All numbers are practitioner estimates.'
    ))

    out.append(P('<b>16.3  Aggregation rule — multiplicative, not additive</b>', H2))
    out.append(P(
        'The future engine must aggregate concept probabilities '
        'multiplicatively, not additively. Additive aggregation '
        'overcounts — it treats each concept as independent, which they '
        'are not (Curve alignment and Fresh zone are correlated, for '
        'example). Multiplicative aggregation respects conditional '
        'dependence: each additional concept lifts the probability '
        'relative to the current probability, not the base rate.', B))
    out.append(P(
        'The formula the engine should use:', B))
    out.append(S(1, 4))
    out.append(h['mono_block']([
        'MULTIPLICATIVE AGGREGATION',
        '',
        '  P(final) = P(base) * (1 + lift_1) * (1 + lift_2) * ... * (1 + lift_n)',
        '',
        '  Where:',
        '    P(base)    = 0.50 (coin flip; no concepts present)',
        '    lift_i     = the lift of concept i (e.g., +0.20 for curve alignment)',
        '                taken from the "Standalone lift" column of Table 16.1',
        '                (or "Lift when confirmed" if the best partners are also present)',
        '',
        '  Cap P(final) at 0.95 — no setup is ever certain.',
        '',
        '  Example: curve alignment (+0.20) + fresh zone (+0.10) + FTR (+0.15)',
        '          + nested zones (+0.22) + engulf at zone (+0.12)',
        '',
        '  P(final) = 0.50 * 1.20 * 1.10 * 1.15 * 1.22 * 1.12',
        '           = 0.50 * 2.09',
        '           = 0.95  → capped at 0.95',
        '',
        '  Example: curve misalignment (-0.25) + fresh zone (+0.10)',
        '',
        '  P(final) = 0.50 * 0.75 * 1.10',
        '           = 0.50 * 0.825',
        '           = 0.41  → below coin flip; do not trade',
    ]))

    out.append(P('<b>16.4  Confidence and position sizing</b>', H2))
    out.append(P(
        'The final probability maps directly to position sizing. The '
        'engine should use a fractional-Kelly approach with a cap to '
        'avoid over-betting on any single trade:', B))
    out.append(S(1, 6))
    out.append(CL('Position sizing from probability', [
        '<b>P < 0.50:</b> no trade. The setup is below coin-flip; the engine must refuse.',
        '<b>0.50 ≤ P < 0.60:</b> minimum size (e.g., 0.25% account risk). The setup is marginal; trade only if no better setup is available.',
        '<b>0.60 ≤ P < 0.70:</b> standard size (e.g., 0.5% account risk). The setup is solid; trade with normal risk management.',
        '<b>0.70 ≤ P < 0.85:</b> elevated size (e.g., 0.75% account risk). The setup is high-quality; trade with confidence.',
        '<b>P ≥ 0.85:</b> maximum size (e.g., 1.0% account risk). The setup is exceptional; rare; trade with full risk.',
        '<b>P ≥ 0.95:</b> capped — never exceed 1.0% account risk on any single trade. Over-betting is the #1 cause of account death even with positive edge.',
    ]))
    out.append(P(
        'This mapping ensures the engine trades more when the edge is '
        'larger and less when the edge is smaller — the core of any '
        'professional risk management system. The future engine must '
        'implement this mapping explicitly and refuse any trade whose '
        'computed probability falls below 0.50.', B))
    return out


def ch17_mistakes(h):
    """Chapter 17 — Common Mistakes and Anti-Patterns."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    numbered_list = h['numbered_list']

    out.append(P(
        '<i>The mistakes catalogued here are the ones every RTM trader '
        'makes on the way to competence. The future engine will make '
        'them too, unless they are explicitly forbidden in its design.</i>',
        h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>17.1  Drawing mistakes</b>', H2))

    out.append(P('<b>Over-tight zones.</b>', H3))
    out.append(P(
        'Drawing zones so tight that the stop is inside market noise. '
        'A zone whose proximal and distal lines are 2 pips apart on '
        'EURUSD is not a zone — it is a level. Zones need width to '
        'capture the institutional inventory; without width, the stop '
        'is too tight and the trade is stopped out by normal volatility '
        'before the reaction occurs. The fix: use the full base range '
        'as the zone width; the proximal line is the base extremum in '
        'the reaction direction, the distal line is the opposite end of '
        'the base. If the resulting stop is too wide for the risk '
        'budget, the trade is not viable — skip it. Do not tighten the '
        'zone to fit the risk budget.', B))

    out.append(P('<b>Marking every base.</b>', H3))
    out.append(P(
        'Treating every consolidation as a base. A base must be at the '
        'origin of an impulse that breaks structure; without the '
        'impulse + BOS, the consolidation is just noise. Marking every '
        'small pause as a zone produces a chart covered in marks and '
        'no thesis — the trader cannot distinguish high-probability '
        'zones from noise. The fix: only mark consolidations whose '
        'departure is impulsive (large body, minimal wicks) AND breaks '
        'structure (BOS). All other consolidations are noise and '
        'should be ignored.', B))

    out.append(P('<b>Ignoring the curve.</b>', H3))
    out.append(P(
        'Marking zones without considering the HTF curve. A demand zone '
        'in a bearish curve is a trap; a supply zone in a bullish curve '
        'is a trap. Marking both directions regardless of the curve '
        'produces a chart where every zone looks tradeable and most are '
        'not. The fix: set the curve first (Pass 1 of the chart-study '
        'protocol). Only mark zones that align with the curve. Counter-'
        'curve zones may be marked for awareness but should be labelled '
        '"counter-curve — skip" and never traded.', B))

    out.append(P('<b>17.2  Reasoning mistakes</b>', H2))

    out.append(P('<b>Confirming instead of falsifying.</b>', H3))
    out.append(P(
        'Looking for evidence that supports the trade and ignoring '
        'evidence that refutes it. This is confirmation bias — the '
        'most common reasoning mistake in trading. The trader sees a '
        'demand zone, decides they want to go long, and notices only '
        'the confirmations (curve alignment, FTR) while ignoring the '
        'disconfirmations (consumed zone, no liquidity target, weak '
        'departure). The fix: actively look for disconfirmations. For '
        'every potential trade, list the failure modes from Chapter 12 '
        'and check each one. If any failure mode is present, the trade '
        'is invalidated. The professional falsifies first; if the trade '
        'survives falsification, it is tradeable.', B))

    out.append(P('<b>Narrative bias.</b>', H3))
    out.append(P(
        'Constructing a story that fits the chart after the fact, then '
        'treating the story as a forecast. The chart shows a demand '
        'zone that reacted; the trader constructs a story about '
        'institutional accumulation and treats the next demand zone as '
        'certain to react. The story feels compelling because it '
        'explains the past; it does not necessarily predict the '
        'future. The fix: distinguish explanation from prediction. '
        'Use the WHY chain to predict, not just to explain. A WHY '
        'chain that explains the past but cannot predict the next move '
        'is a story, not an analysis.', B))

    out.append(P('<b>Ignoring the higher timeframe.</b>', H3))
    out.append(P(
        'Reading the LTF in isolation. The LTF cannot define its own '
        'context — the context comes from the HTF. A trader who reads '
        'only H1 will misread every H1 pattern that is actually a '
        'correction inside an H4 trend. The fix: always start with the '
        'HTF. Pass 1 of the chart-study protocol is the curve; nothing '
        'else matters until the curve is set. The LTF is for execution '
        'only, not for direction.', B))

    out.append(P('<b>17.3  Execution mistakes</b>', H2))

    out.append(P('<b>Entering on touch without confirmation.</b>', H3))
    out.append(P(
        'Entering at a zone touch without waiting for the trigger '
        '(engulf, decision candle, sweep reversal). The touch is the '
        'location; the trigger is the confirmation. Entering on touch '
        'turns every zone into a 50/50 gamble — sometimes the zone '
        'reacts, sometimes it doesn\'t, and without the trigger there '
        'is no way to distinguish. The fix: never enter on touch. '
        'Wait for the trigger. The trigger costs a few pips of entry '
        'price but adds 15-20% to the hit rate — a profitable trade-off.', B))

    out.append(P('<b>Ignoring failure conditions.</b>', H3))
    out.append(P(
        'Entering a trade and then not monitoring the failure '
        'conditions. Every trade has failure conditions (Chapter 12); '
        'ignoring them turns a small loss into a large loss when the '
        'failure occurs. The fix: before entering, list the failure '
        'conditions and set price alerts at each one. When a failure '
        'condition triggers, exit immediately — do not "give it '
        'room". The room is the institution\'s space, not yours.', B))

    out.append(P('<b>No invalidation logic.</b>', H3))
    out.append(P(
        'Entering a trade without a defined invalidation level. '
        '"I\'ll exit if it looks wrong" is not an invalidation — it is '
        'an open-ended commitment to lose an unknown amount. The fix: '
        'define the invalidation level before entering. The invalidation '
        'must be structural — beyond a zone edge, beyond a sweep '
        'extreme, beyond a defining swing. Place the stop there. If '
        'the stop is too wide for the risk budget, the trade is not '
        'viable — skip it. Do not widen the stop to fit the trade.', B))

    out.append(P('<b>17.4  Self-audit checklist</b>', H2))
    out.append(P(
        'The following 12 yes/no questions form a self-audit the '
        'professional applies to every trade before entering. The '
        'future engine should apply the same audit and refuse any '
        'trade that fails any question.', B))
    out.append(S(1, 6))
    out.extend(numbered_list([
        'Is the HTF curve clearly defined and aligned with the trade direction?',
        'Is the entry zone fresh (untouched since creation)?',
        'Is the entry zone nested inside at least one HTF zone?',
        'Did the original departure from the zone\'s base break structure (BOS)?',
        'Is there a defined trigger (engulf, decision candle, sweep reversal) for the entry?',
        'Is the stop loss at a structural level (zone edge, sweep extreme, defining swing)?',
        'Is the target at a defined HTF liquidity pool?',
        'Is the risk:reward ratio at least 1:2 to the first target?',
        'Have all failure modes from Chapter 12 been checked and none are present?',
        'Is the WHY chain complete — all 15 questions from Chapter 14 answered?',
        'Is the position size consistent with the computed probability (Chapter 16)?',
        'If this trade loses, will the loss be within the daily risk budget?',
    ]))
    out.append(S(1, 6))
    out.append(P(
        'A "no" to any question means the trade is not ready. The '
        'professional does not enter; the engine must not issue a '
        'signal. There will be another setup tomorrow. The cost of '
        'patience is small; the cost of impatience is the account.', B))
    return out


def ch18_bridge(h):
    """Chapter 18 — Bridge to the Trading Engine."""
    out = []
    P, S, B, CL = h['Paragraph'], h['Spacer'], h['BODY'], h['callout']
    H2, H3 = h['H2'], h['H3']
    numbered_list = h['numbered_list']

    out.append(P(
        '<i>This volume ends where the next phase begins. The knowledge '
        'base is complete; the trading engine is not yet designed. '
        'This chapter prepares the bridge — what the engine must do, '
        'what it must not do, and the modules it must contain.</i>',
        h['BODY_LEAD']))
    out.append(S(1, 10))

    out.append(P('<b>18.1  What the engine MUST do</b>', H2))
    out.append(P(
        'The future RTM trading engine is the operational form of this '
        'knowledge base. Its responsibilities are derived directly from '
        'the concepts and protocols in this volume — nothing more, '
        'nothing less. The engine must, at minimum:', B))
    out.append(S(1, 6))
    out.extend(numbered_list([
        '<b>Detect market structure</b> on multiple timeframes: swings, impulses, corrections, BOS, CHoCH. Structure detection is the foundation; every other module depends on it. The detector must produce a structured representation of the current structure on each timeframe, including the defining swings and the most recent BOS/CHoCH events.',
        '<b>Score zone freshness</b> for every zone it identifies. Freshness is the single most important zone-quality dimension; the engine must track the touch count and time-since-creation for every zone, and must decay freshness probability according to the rules in Chapter 6 (1 touch: -10%, 2 touches: -25%, 3+ touches: -50%).',
        '<b>Track liquidity</b> by mapping obvious swing highs and lows on every timeframe. The engine must identify liquidity pools, classify them as buy-side or sell-side, track whether each has been swept, and identify the MPL (the highest-timeframe unswept pool in the curve direction).',
        '<b>Compute the curve</b> on the highest relevant timeframe and propagate it down to lower timeframes. The curve is the master direction; the engine must refuse any trade that conflicts with the curve, and must re-compute the curve on any HTF CHoCH + BOS confirmation.',
        '<b>Generate WHY chains</b> for every candidate signal, using the 15-question template from Chapter 14. The engine must output the full WHY chain as part of every signal; a signal without a chain is a violation of the engine\'s design.',
        '<b>Aggregate probabilities multiplicatively</b> using the matrix in Chapter 16. The engine must not add probabilities; it must multiply (1 + lift) factors, cap at 0.95, and refuse any trade with P < 0.50.',
        '<b>Apply the self-audit checklist</b> (Chapter 17, 12 questions) to every candidate signal. A signal that fails any question must not be issued.',
        '<b>Monitor failure conditions</b> from Chapter 12 for every open trade. The engine must exit immediately when a failure condition triggers — no exceptions, no "give it room".',
    ]))

    out.append(P('<b>18.2  What the engine MUST NOT do</b>', H2))
    out.append(P(
        'Equally important are the prohibitions. The following are '
        'incompatible with RTM and must be excluded from the engine\'s '
        'design:', B))
    out.append(S(1, 6))
    out.extend(numbered_list([
        '<b>No indicators.</b> No moving averages, no oscillators, no bands, no Fibonacci, no volume profiles. The engine derives every signal from price structure and liquidity; indicators are derivatives of price and contain no additional information. Adding even one indicator starts the slow death of the system.',
        '<b>No hybridisation.</b> No combining RTM with other methodologies — no ICT concepts outside the RTM subset, no SMC patterns not in this volume, no statistical arbitrage, no machine-learning overlays. RTM is self-contained; hybridisation destroys the discipline that makes it work.',
        '<b>No signals without WHY chains.</b> A signal that cannot produce a complete 15-question WHY chain is a guess, not a signal. The engine must refuse to issue it. This is the operational form of the RTM axiom: every move has a reason.',
        '<b>No trade without structural invalidation.</b> A trade whose stop loss is not at a structural level is a gamble. The engine must refuse it. "Wider for safety" is not structural — it is fear encoded as risk management.',
        '<b>No averaging down.</b> When a trade goes against the engine, the engine does not add to the position. The institutional intent has changed; the engine should exit, not double down. Averaging down is how retail accounts die.',
        '<b>No skipping the HTF.</b> The engine must always start its analysis from the highest relevant timeframe. Skipping the HTF to trade an LTF setup is the most common execution mistake; the engine must be designed to refuse it.',
    ]))

    out.append(P('<b>18.3  The seven mandatory modules</b>', H2))
    out.append(P(
        'The engine\'s architecture is derived directly from this '
        'knowledge base. Seven modules are mandatory — each corresponds '
        'to a cluster in the knowledge graph. The modules and their '
        'responsibilities:', B))
    out.append(S(1, 6))
    module_data = [[
        P('Module', h['TBL_HEADER']),
        P('Cluster origin', h['TBL_HEADER']),
        P('Responsibility', h['TBL_HEADER']),
    ]]
    modules = [
        ('Structure Detector', 'Structure (Ch 5)',
         'Detect swings, impulses, corrections, BOS, CHoCH on every timeframe. Output: structured representation of current and historical structure per timeframe.'),
        ('Zone Engine', 'Zones (Ch 6)',
         'Identify supply and demand zones from bases + impulsive departures. Score each zone on the 5-dimension quality scale. Output: ranked list of active zones per timeframe.'),
        ('Freshness Tracker', 'Zones (Ch 6) + Quality',
         'Track touch count and time-since-creation for every zone. Decay freshness probability according to the rules in Chapter 6. Output: freshness score per zone.'),
        ('Liquidity Mapper', 'Liquidity (Ch 9)',
         'Map obvious swing highs and lows as liquidity pools. Track swept status. Identify the MPL. Output: liquidity map per timeframe, with buy-side and sell-side pools labelled.'),
        ('Curve Engine', 'MTF (Ch 10) + Structure',
         'Compute the curve on the highest relevant timeframe. Propagate down. Re-compute on HTF CHoCH + BOS. Output: curve direction per timeframe, with the parent-child hierarchy.'),
        ('Pattern Recogniser', 'Patterns (Ch 7-8)',
         'Detect compressions, engulfs, FTRs, flags, FLs, QMs, Diamonds, sweeps. Validate each pattern against the failure conditions in Chapter 12. Output: candidate patterns per timeframe, with validity flags.'),
        ('Reasoning Generator', 'All clusters',
         'For each candidate pattern, generate the full 15-question WHY chain (Chapter 14). Aggregate probability multiplicatively (Chapter 16). Apply the self-audit (Chapter 17). Output: signal with WHY chain, probability, and position size, or rejection with reason.'),
    ]
    for m, c, r in modules:
        module_data.append([P(m, h['TBL_CELL_BOLD']), P(c, h['TBL_CELL']), P(r, h['TBL_CELL'])])
    out.extend(h['std_table'](
        module_data,
        col_ratios=[0.20, 0.20, 0.60],
        caption_text='Table 18.1 — The seven mandatory modules of the future RTM trading engine.'
    ))

    out.append(P('<b>18.4  The principle of "no signal without a WHY chain"</b>', H2))
    out.append(P(
        'If the engine\'s design has one founding principle, this is '
        'it: <i>no signal is ever issued without a complete WHY '
        'chain</i>. The WHY chain is the engine\'s reasoning audit; it '
        'is what separates a trade from a gamble. A signal without a '
        'chain is the engine admitting it does not know why it is '
        'trading — and an engine that does not know why it is trading '
        'is dangerous. The principle must be enforced at the '
        'architectural level: the signal-issuance path must require a '
        'complete WHY chain as a precondition, and must refuse to '
        'proceed if any of the 15 questions cannot be answered.', B))
    out.append(P(
        'This principle is the operational form of Axiom 1 from '
        'Chapter 2: <i>every move has a reason</i>. If the engine '
        'cannot identify the reason, it has not finished reading the '
        'chart — it has only finished looking at it. The future engine '
        'must hold itself to the same standard.', B))

    out.append(P('<b>18.5  What the next research phase should add</b>', H2))
    out.append(P(
        'This volume is the foundation, not the complete structure. '
        'Before the engine is built, the following research phases '
        'should extend the knowledge base:', B))
    out.append(S(1, 6))
    out.extend(numbered_list([
        '<b>More chart studies.</b> The 11 worked reasoning cases in Chapters 14-15 are the initial dataset; the engine needs at least 100 cases to train its reasoning module reliably. Each new case should cover a different combination of concepts from the knowledge graph.',
        '<b>Edge case catalog.</b> The failure catalog in Chapter 12 covers the common failure modes; the engine needs an extended catalog covering rare edge cases (e.g., news-event failures, gap failures, session-open failures).',
        '<b>Failure back-testing protocol.</b> The probability numbers in Chapter 16 are practitioner estimates; the engine needs a back-testing protocol to refine them. The protocol should test each concept\'s standalone and confluence lift on historical data, and update the matrix accordingly.',
        '<b>Session and time-of-day overlays.</b> RTM is timeframe-aware but not session-aware in this volume. The next phase should add session context (Asian, London, New York) and time-of-day patterns (open/close behavior, lunch lull, etc.) as additional context dimensions.',
        '<b>Instrument-specific calibration.</b> Different instruments have different institutional footprints. The next phase should calibrate the knowledge base for specific instruments (FX majors, indices, commodities, crypto) — the concepts remain the same, but the parameters (zone width, sweep depth, FL retracement) differ.',
    ]))

    out.append(P('<b>18.6  Closing</b>', H2))
    out.append(P(
        'The goal of Phase Zero was to become an RTM expert before '
        'designing the AI. This volume is the artefact of that '
        'expertise: a complete knowledge base, a knowledge graph, a '
        'failure catalog, a reasoning dataset, a probability matrix, '
        'and a bridge to the future engine. The next phase — engine '
        'design — can now begin with the confidence that the designer '
        'thinks like a professional RTM trader, not like a software '
        'engineer guessing at a trading system.', B))
    out.append(P(
        'The single most important thing to carry forward is the '
        'discipline: <i>no signal without a WHY chain</i>. Every '
        'architectural decision in the engine\'s design should be '
        'evaluated against this principle. If a design choice would '
        'allow the engine to issue a signal without a complete WHY '
        'chain, the choice is wrong, regardless of any other '
        'consideration. The WHY chain is the engine\'s contract with '
        'the trader; breaking it is the engine\'s only unforgivable '
        'sin.', B))
    return out

import { db } from "@workspace/db";
import {
  topicsTable,
  lecturesTable,
  assignmentsTable,
  problemsTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";

type SeedTopic = {
  slug: string;
  title: string;
  weekNumber: number;
  blurb: string;
  lectureTitle: string;
  body: string;
};

const TOPICS: SeedTopic[] = [
  // ───────────────────────────────────────────────────────────────
  // Week 1 — Foundations of evolutionary psychology
  // ───────────────────────────────────────────────────────────────
  {
    slug: "evopsych-what-why",
    title: "What evolutionary psychology is and why it exists",
    weekNumber: 1,
    blurb: "The mind as a product of natural selection.",
    lectureTitle: "1.1 What evolutionary psychology is and why it exists",
    body: `# What evolutionary psychology is and why it exists

Evolutionary psychology is the study of the human mind as a product of evolution. Its central premise is simple but radical: the brain is a biological organ, shaped by natural selection over millions of years to solve the recurrent problems faced by our ancestors. If the hand, the eye, and the immune system are adaptations, then so are the mechanisms of fear, attraction, memory, and language.

## The core claim

The founding idea, developed by Leda Cosmides and John Tooby in the late 1980s, is that **the mind is a set of information-processing devices** — evolved programs — each designed to solve a specific adaptive problem. There is no single, general-purpose "thinking machine." Instead there are many specialized systems: one for detecting cheaters in social exchange, one for choosing mates, one for avoiding contaminated food, and so on.

## Why it exists

Before evolutionary psychology, psychology often treated the mind as a blank slate, infinitely shaped by culture and learning. But a blank slate cannot explain *why* humans everywhere fear snakes more easily than cars, why every culture has language with the same deep structure, or why jealousy follows predictable patterns. Evolution supplies the missing explanation: our minds come pre-loaded with structure because structured minds out-reproduced unstructured ones.

## Tinbergen's four questions

The biologist Niko Tinbergen pointed out that any trait can be explained at four levels: its **mechanism** (how it works now), its **development** (how it grows in the individual), its **function** (what it was selected for), and its **phylogeny** (its evolutionary history). Evolutionary psychology specializes in the *function* question — but the four are complementary, not competing.

## A grounding example

Consider the human preference for sweet and fatty foods. A blank-slate account struggles: nobody teaches a baby to like sugar. The evolutionary account is immediate — in ancestral environments, calories were scarce and ripe fruit and fat were rare, valuable energy sources. A taste system that rewarded eating them was favored by selection. The same mechanism that was adaptive then now drives obesity in a world of cheap calories — a mismatch we will return to repeatedly.`,
  },
  {
    slug: "natural-selection-adaptation",
    title: "Natural selection and adaptation",
    weekNumber: 1,
    blurb: "How selection builds functional design without a designer.",
    lectureTitle: "1.2 Natural selection and adaptation",
    body: `# Natural selection and adaptation

Natural selection is the only known natural process that builds complex functional design. Understanding it precisely is the foundation of everything that follows.

## The logic of selection

Darwin's argument needs only three ingredients:

- **Variation** — individuals differ from one another.
- **Heritability** — some of that variation is passed to offspring.
- **Differential reproduction** — some variants leave more surviving offspring than others.

When all three hold, the traits that promote reproduction become more common over generations. No foresight, no goal, no designer — just the statistical accumulation of what works.

## What an adaptation is

An **adaptation** is a trait that exists *because* it solved a recurrent reproductive problem in ancestral environments. The defining signature of an adaptation is *functional design*: complex, coordinated machinery that is improbably well-suited to a specific task. The vertebrate eye, with its lens, aperture, and light-sensitive retina, is not an accident — its parts fit together to do one thing, see.

## Byproducts and noise

Not every trait is an adaptation. **Byproducts** ride along with adaptations without being selected for themselves — the whiteness of bone is a byproduct of calcium, not a selected color. **Noise** is random variation with no function. Distinguishing adaptation from byproduct from noise is one of the hardest and most important tasks in the field.

## A grounding example

The human eye's blind spot is a clue to how selection actually works. Because the optic nerve passes *in front of* the retina in vertebrates, there is a hole in the visual field. A designer starting from scratch would never do this — the octopus eye, evolved separately, has the wiring behind the retina and no blind spot. Selection does not optimize; it tinkers with whatever is already there. Adaptations are good enough, not perfect.`,
  },
  {
    slug: "genes-inheritance-replication",
    title: "Genes, inheritance, and replication",
    weekNumber: 1,
    blurb: "The gene's-eye view: replicators and vehicles.",
    lectureTitle: "1.3 Genes, inheritance, and replication",
    body: `# Genes, inheritance, and replication

Selection acts on traits, but traits are not inherited directly — *genes* are. To understand why minds are the way they are, we have to descend to the level of the replicating molecule.

## Replicators and vehicles

In Richard Dawkins's framing, a **replicator** is an entity that makes copies of itself; a **vehicle** is the body that carries replicators and interacts with the world. Genes are the replicators; organisms are the vehicles. The crucial shift in perspective is this: bodies are temporary, but a gene can persist across countless generations. Selection therefore favors genes that build vehicles good at propagating those very genes.

## Why "the selfish gene" is not about selfishness

The phrase is often misread. A gene is "selfish" only in the metaphorical sense that it spreads if it raises its own frequency — even when doing so makes the *organism* behave generously. A gene that makes a mother sacrifice for her children can spread precisely because copies of it sit inside those children. The gene's-eye view explains altruism, not just competition.

## Genotype and phenotype

The **genotype** is the genetic code; the **phenotype** is the observable trait it helps produce, always in interaction with the environment. Genes do not encode behaviors directly. They build developmental systems that, given normal inputs, reliably produce adaptive phenotypes. "Genetic" never means "fixed" or "unchangeable."

## A grounding example

Consider lactase persistence — the ability to digest milk into adulthood. In populations with a long history of dairying, a gene variant that keeps the lactase enzyme switched on spread rapidly over just a few thousand years. The same gene is rare where dairying never took hold. Here we can watch the whole chain: a replicator, a measurable phenotype, an environmental problem (a new food source), and selection raising the gene's frequency.`,
  },
  {
    slug: "sexual-selection",
    title: "Sexual selection",
    weekNumber: 1,
    blurb: "Selection for traits that win mates, not just survival.",
    lectureTitle: "1.4 Sexual selection",
    body: `# Sexual selection

Darwin noticed a puzzle: some traits seem to *hurt* survival. The peacock's tail is heavy, conspicuous, and metabolically expensive. Why would selection build it? His answer was a second engine of evolution.

## Two kinds of competition

**Sexual selection** is selection for traits that improve mating success rather than survival. It operates through two mechanisms:

- **Intrasexual selection** — members of one sex compete directly with each other for access to mates (think of antlers and male-male combat).
- **Intersexual selection** — members of one sex choose mates based on certain traits (think of peahens choosing the showiest tail).

A trait can spread even if it shortens life, as long as it raises reproduction enough to compensate.

## The handicap principle

Why should a costly ornament signal quality? Amotz Zahavi's **handicap principle** answers: a signal is reliable precisely *because* it is costly. Only a genuinely healthy, well-fed peacock can afford to grow and haul around an enormous tail. The cost guarantees the signal cannot be faked. Honest signals must be expensive.

## Why this matters for the human mind

Many human traits — humor, music, generosity, creativity, and aspects of language — may be partly products of sexual selection, advertising the quality of the underlying brain. This reframes courtship displays not as cultural frills but as fitness indicators.

## A grounding example

The long tail of the male widowbird was tested directly by Malte Andersson. He cut tails short on some males and glued the cut pieces onto others, making them artificially long. Males with experimentally lengthened tails attracted far more mates than shortened ones, even though the long tail offered no survival benefit. Female choice alone was driving the trait — sexual selection caught in the act.`,
  },
  {
    slug: "inclusive-fitness-kin-selection",
    title: "Inclusive fitness and kin selection",
    weekNumber: 1,
    blurb: "Hamilton's rule and why we help relatives.",
    lectureTitle: "1.5 Inclusive fitness and kin selection",
    body: `# Inclusive fitness and kin selection

If genes are what spread, then helping a relative — who carries copies of your genes — can be a way of propagating those genes indirectly. This insight, due to W. D. Hamilton, solved one of biology's deepest puzzles: the existence of self-sacrifice.

## Inclusive fitness

**Inclusive fitness** is an organism's total genetic contribution to the next generation: its own offspring (*direct* fitness) plus its effect on the reproduction of relatives, weighted by relatedness (*indirect* fitness). Natural selection maximizes inclusive fitness, not mere personal survival.

## Hamilton's rule

The condition for an altruistic act to be favored is captured in one inequality, **Hamilton's rule**: an act spreads when $rB > C$, where $r$ is the coefficient of relatedness between actor and recipient, $B$ is the reproductive benefit to the recipient, and $C$ is the cost to the actor. The closer the relative and the larger the benefit relative to cost, the more selection favors helping.

## Coefficients of relatedness

For sexually reproducing organisms, $r = 1/2$ for parent and child or for full siblings, $r = 1/4$ for grandparent and grandchild or for aunt and niece, and $r = 1/8$ for first cousins. J. B. S. Haldane joked that he would lay down his life for two brothers or eight cousins — a precise application of the math.

## A grounding example

Belding's ground squirrels give alarm calls when a predator approaches, drawing dangerous attention to the caller. The behavior looks suicidal until you notice *who* calls: females, who stay near their birthplace surrounded by relatives, call far more than dispersing males. The alarm protects kin who share the caller's genes — exactly what Hamilton's rule predicts.`,
  },
  {
    slug: "adapted-mind-modularity",
    title: "The adapted mind and modularity",
    weekNumber: 1,
    blurb: "Many specialized programs, not one general computer.",
    lectureTitle: "1.6 The adapted mind and modularity",
    body: `# The adapted mind and modularity

If the mind is a product of selection, what is its architecture? The evolutionary answer is **modularity**: the mind is not a single all-purpose computer but a large collection of specialized programs, each shaped for a particular adaptive problem.

## Why specialized, not general

A general-purpose problem-solver faces a fatal difficulty: most adaptive problems have *different* optimal solutions. The rules for choosing a mate are not the rules for choosing food, which are not the rules for avoiding predators. A mechanism tuned to one problem will be wrong for another. Selection therefore favors many domain-specific mechanisms, each carrying built-in knowledge about its own problem.

## The Swiss Army knife metaphor

Cosmides and Tooby compare the mind to a Swiss Army knife: a bundle of distinct tools, each shaped for a job. This does not mean the modules are isolated boxes in the brain — they can overlap and interact — but functionally they embody different rules tuned to different domains.

## The grain of truth in "instinct blindness"

We are blind to our own instincts precisely because they work so smoothly. Seeing in three dimensions, recognizing a face, parsing a sentence — these feel effortless and obvious, which conceals the enormous specialized machinery doing the work. The seeming ease is evidence *for* dedicated design, not against it.

## A grounding example

The **Wason selection task** reveals modularity sharply. When people are asked to test an abstract logical rule ("if a card shows an even number, the other side is red"), most fail. But when the *identical* logic is framed as a social-contract cheater-detection problem ("if someone drinks alcohol, they must be over 18"), performance jumps dramatically. We do not reason with one general logic engine; we have a specialized mechanism for catching cheaters in social exchange.`,
  },
  {
    slug: "levels-of-explanation",
    title: "Levels of explanation and common misunderstandings",
    weekNumber: 1,
    blurb: "Avoiding the naturalistic fallacy and genetic determinism.",
    lectureTitle: "1.7 Levels of explanation and common misunderstandings",
    body: `# Levels of explanation and common misunderstandings

Evolutionary psychology is more misunderstood than almost any field. Most objections target claims the field does not make. Clearing them away is essential before going further.

## Proximate vs. ultimate causes

Every behavior has two complementary explanations. A **proximate** explanation describes the immediate machinery — hormones, neurons, learning, stimuli. An **ultimate** explanation describes the evolutionary function — why selection built that machinery. "A mother loves her baby because of oxytocin" and "because caring for offspring propagated her genes" are both true; they answer different questions and do not compete.

## The naturalistic fallacy

The **naturalistic fallacy** is the error of inferring *ought* from *is* — assuming that whatever evolved is therefore good or justified. Evolution explains why infanticide, deception, and violence exist under certain conditions; it never endorses them. Describing a tendency is not approving of it. Understanding a disease is the first step to curing it.

## Genetic determinism is not the claim

Saying a trait is an adaptation does **not** mean it is fixed, inevitable, or unchangeable. Adaptations are typically *conditional* — they produce different outputs depending on environmental inputs. Calluses are an adaptation, but you only grow them where there is friction. Most evolved psychology works the same way: if-then programs sensitive to context.

## A grounding example

Consider the claim that men are, on average, more physically aggressive than women. The naturalistic fallacy would (wrongly) conclude that male violence is therefore acceptable. Genetic determinism would (wrongly) conclude that nothing can change it. The correct evolutionary reading is conditional: aggression is a strategy that paid off for ancestral males under specific circumstances (competition for status and mates), and rates vary enormously with context — which is exactly why societies that reduce those incentives see far less violence.`,
  },

  // ───────────────────────────────────────────────────────────────
  // Week 2 — Survival and the evolved individual
  // ───────────────────────────────────────────────────────────────
  {
    slug: "survival-evolved-body",
    title: "Survival and the evolved body",
    weekNumber: 2,
    blurb: "The body as a record of ancestral survival problems.",
    lectureTitle: "2.1 Survival and the evolved body",
    body: `# Survival and the evolved body

Reproduction requires survival first. Before an organism can pass on genes, it must find food, avoid predators, regulate temperature, and stay healthy long enough to mate. The body and its associated psychology are a record of the survival problems our ancestors faced.

## Survival as a precondition, not the goal

A common misconception is that organisms are designed to survive. They are not. They are designed to *reproduce*, and survival is merely a means to that end. This is why selection will trade survival for reproduction — salmon swim upstream and die after spawning, and human risk-taking peaks in young males competing for status. Survival mechanisms are calibrated to serve lifetime reproductive success, not longevity.

## Homeostasis and regulation

Much of our evolved machinery maintains internal balance: thermoregulation (sweating, shivering), hunger and satiety, thirst, sleep. These systems feel automatic precisely because they are ancient and reliable. Each represents a solution to a survival problem so persistent that selection hardwired the response.

## The environment of evolutionary adaptedness

Our survival mechanisms were tuned to the **environment of evolutionary adaptedness (EEA)** — the statistical composite of ancestral conditions, largely the Pleistocene foraging world. Because the modern environment differs so sharply, many once-adaptive mechanisms now misfire: we crave more salt and sugar than is healthy, and we under-exercise because conserving energy was once wise.

## A grounding example

The fight-or-flight response is a survival adaptation laid bare. A perceived threat triggers a cascade — adrenaline, raised heart rate, blood diverted to muscles, sharpened attention — that prepared an ancestor to fight or flee a predator within seconds. The same system now fires during a job interview or a traffic jam, flooding the body with stress hormones for threats that cannot be outrun. The mechanism is ancient; the trigger is modern; the mismatch is the source of chronic stress.`,
  },
  {
    slug: "foraging-food-palate",
    title: "Foraging, food, and the evolved palate",
    weekNumber: 2,
    blurb: "Why we crave what we crave.",
    lectureTitle: "2.2 Foraging, food, and the evolved palate",
    body: `# Foraging, food, and the evolved palate

Finding and choosing food was a daily, life-or-death problem for our ancestors. The result is a sophisticated set of evolved mechanisms governing what tastes good, what disgusts us, and how we search for food.

## The logic of taste

Our five basic tastes map onto ancestral nutritional problems. **Sweet** signals ripe fruit and quick energy. **Salt** signals scarce but essential electrolytes. **Umami** signals protein. **Bitter** and **sour** often signal toxins or spoilage and trigger rejection. Taste is not arbitrary preference — it is an evolved nutrient-detection system.

## Optimal foraging theory

Foraging animals, including ancestral humans, behave as if solving a cost-benefit problem: maximize calories and nutrients gained per unit of time and energy spent. **Optimal foraging theory** predicts which foods a forager should pursue and which to ignore, and it successfully describes the diets of contemporary hunter-gatherers.

## Omnivore's dilemma and food learning

As omnivores, humans face a tension: dietary flexibility lets us exploit many foods, but each new food is a potential poison. We resolve this with specialized learning — strong **one-trial taste aversion** (a single bout of nausea can make a food repellent for life) and a wariness of novel foods called food neophobia, strongest in childhood.

## A grounding example

The Garcia effect, discovered by John Garcia, shows taste learning is special. Rats that became ill hours after tasting a novel flavor avoided that flavor forever — even though the illness came long after eating, violating ordinary learning rules that require close timing. The same delayed, single-trial aversion appears in humans: people who get sick after a meal often develop a lasting disgust for that food, even when they *know* it was a virus, not the food. The mechanism is an evolved poison-avoidance system that overrides conscious belief.`,
  },
  {
    slug: "fear-predators-threat-detection",
    title: "Fear, predators, and threat detection",
    weekNumber: 2,
    blurb: "An evolved alarm system biased toward false alarms.",
    lectureTitle: "2.3 Fear, predators, and threat detection",
    body: `# Fear, predators, and threat detection

Fear is one of the most studied evolved emotions. It is an alarm system designed to detect and respond to ancestral dangers — and its design reveals a deep logic of error management.

## Prepared fears

Humans acquire fears of certain stimuli — snakes, spiders, heights, deep water, the dark, strangers — far more readily than fears of modern, more dangerous things like cars or electrical outlets. These **prepared fears** track *ancestral* threats, not current statistics. A child learns to fear a snake after one frightening experience; learning to fear a car takes constant warning and rarely "sticks" the same way.

## Error management theory

A smoke detector that occasionally goes off when you make toast is annoying — but a detector that fails to fire during a real fire is fatal. **Error management theory** explains why the fear system is biased toward false alarms: the cost of a false positive (fleeing a stick mistaken for a snake) is trivial compared with the cost of a false negative (ignoring a real snake). Selection tuned the system to over-react.

## The fast and slow routes

Joseph LeDoux mapped two pathways for fear in the brain: a fast, crude route through the amygdala that triggers a response *before* conscious recognition, and a slower cortical route that evaluates the threat in detail. The fast route makes you jump back from the coiled shape on the trail a fraction of a second before you consciously realize whether it is a snake or a rope.

## A grounding example

Studies using visual search show the **snake-detection advantage**: people spot a snake among flowers far faster than a flower among snakes, and this bias appears even in infants and in people who have never encountered a live snake. Anthropologist Lynne Isbell has argued that the pressure from snakes was so persistent across primate evolution that it shaped the very acuity of our visual system — our excellent close-range vision may itself be, in part, a snake-detection adaptation.`,
  },
  {
    slug: "habitat-preferences-cognition",
    title: "Habitat preferences and environmental cognition",
    weekNumber: 2,
    blurb: "Savanna preferences and the spatial mind.",
    lectureTitle: "2.4 Habitat preferences and environmental cognition",
    body: `# Habitat preferences and environmental cognition

Where to live, where to find water, how to navigate home — these spatial problems shaped both our preferences for landscapes and the cognitive machinery we use to move through the world.

## The savanna hypothesis

Gordon Orians proposed that humans carry an evolved preference for habitats resembling the African savanna where our genus arose: open grassland dotted with trees, the presence of water, and varied terrain offering both resources and refuge. Across cultures, people asked to rate landscapes tend to prefer savanna-like scenes — and this preference is strongest in young children, before culture has much chance to shape taste.

## Prospect and refuge

Jay Appleton's **prospect-refuge theory** holds that we are drawn to places that offer both *prospect* (a clear view to detect resources and threats) and *refuge* (a place to hide and be safe). The appeal of a hilltop house with a view, or a restaurant table with your back to the wall facing the door, reflects this ancient calculus: see without being seen.

## Sex differences in spatial cognition

On average, men and women show different spatial strengths that may track a division of foraging labor. Men tend to perform better on mental-rotation and route-distance tasks (consistent with hunting and long-range travel), while women tend to excel at object-location memory (consistent with gathering, which rewards remembering where food plants are). These are average differences with large overlap, not categorical divides.

## A grounding example

In a now-classic study, Irwin Silverman and Marion Eals tested object-location memory by briefly showing people a cluttered array of objects and later asking which had moved. Women outperformed men at remembering the spatial layout of objects — precisely the skill an effective gatherer needs to relocate productive plants season after season. The result links a measurable cognitive sex difference to a specific ancestral foraging problem.`,
  },
  {
    slug: "disease-avoidance-immune-system",
    title: "Disease avoidance and the behavioral immune system",
    weekNumber: 2,
    blurb: "Disgust as a first line of defense against pathogens.",
    lectureTitle: "2.5 Disease avoidance and the behavioral immune system",
    body: `# Disease avoidance and the behavioral immune system

The biological immune system fights pathogens *after* they enter the body — a costly, last-ditch defense. Selection also built a cheaper, earlier line of defense: a psychological system that helps us avoid pathogens in the first place.

## The behavioral immune system

The **behavioral immune system** is a suite of perceptual and emotional mechanisms — spearheaded by disgust — that detect cues of infection and motivate avoidance. Rotting food, bodily waste, open wounds, and signs of illness in others all trigger disgust and withdrawal. It is a smoke detector for pathogens.

## Why disgust has the triggers it does

The elicitors of disgust are not random: feces, vomit, blood, corpses, oozing sores, and spoiled food are all reliable ancestral sources of contagion. Disgust also shows **contamination sensitivity** — a cockroach briefly touching food ruins the whole plate, because pathogens spread invisibly. This "better safe than sorry" logic is error management again.

## Costs and overgeneralization

Like all error-managed systems, the behavioral immune system over-fires. It can attach to harmless cues that merely *resemble* disease — unusual appearances, disfigurement, or unfamiliar people — and has been linked to xenophobia and prejudice. Recognizing this helps separate the *mechanism* from the *moral judgment*: understanding the bias is the route to counteracting it.

## A grounding example

Valerie Curtis and colleagues surveyed disgust reactions across dozens of countries and found striking universality: images carrying disease cues (bodily fluids, signs of illness) were rated most disgusting everywhere, regardless of culture. In a complementary finding, pregnant women in the first trimester — when the immune system is suppressed to tolerate the fetus and the embryo is most vulnerable — show heightened disgust and food aversions, exactly when extra pathogen avoidance would pay off. The system is dialed up precisely when the body is most at risk.`,
  },
  {
    slug: "life-history-theory",
    title: "Life history theory",
    weekNumber: 2,
    blurb: "Trade-offs in how organisms budget time and energy.",
    lectureTitle: "2.6 Life history theory",
    body: `# Life history theory

Every organism has finite time and energy. **Life history theory** studies how selection allocates that budget across competing demands — growth, maintenance, and reproduction — and across the timing of a life.

## The fundamental trade-offs

Resources spent on one function cannot be spent on another. The key trade-offs are:

- **Current vs. future reproduction** — reproduce now, or grow and reproduce more later?
- **Quantity vs. quality of offspring** — many cheap offspring, or few well-provisioned ones?
- **Mating effort vs. parenting effort** — invest in acquiring mates, or in raising existing young?

There is no universally best answer; the optimal strategy depends on the environment.

## Fast vs. slow strategies

Environments shape where organisms fall on a **fast–slow continuum**. Harsh, unpredictable environments with high mortality favor a *fast* strategy: mature early, reproduce young, have many offspring, invest less in each. Stable, safe environments favor a *slow* strategy: mature late, reproduce later, invest heavily in fewer offspring. Humans overall are an extreme *slow* species, but individuals shift along the continuum based on cues from their childhood environment.

## Calibration by early experience

The developing organism reads its early environment as a forecast of the world it will face. Harshness and unpredictability in childhood tend to shift development toward a faster strategy — earlier puberty, earlier sexual activity, more present-oriented decision-making. This is not pathology; it is an evolved calibration to a dangerous world where waiting may mean never reproducing at all.

## A grounding example

Studies on father absence find that girls who grow up without a father present tend, on average, to reach puberty earlier and become sexually active younger than girls with involved fathers. Life history theory interprets this not as damage but as facultative calibration: the absence of paternal investment is a cue that the local environment is one of low male commitment and instability, conditions under which an earlier, faster reproductive strategy historically paid off.`,
  },
  {
    slug: "development-child-mind",
    title: "Development and the shaping of the child mind",
    weekNumber: 2,
    blurb: "How evolved programs unfold across childhood.",
    lectureTitle: "2.7 Development and the shaping of the child mind",
    body: `# Development and the shaping of the child mind

Adaptations are not present fully formed at birth; they unfold through development. Evolutionary developmental psychology studies how evolved programs construct themselves across childhood, often using the environment as a necessary input.

## Childhood as an adaptation

Human childhood is extraordinarily long. Why spend years dependent and unproductive? Because the human niche depends on learning an enormous amount — about local plants, animals, tools, language, and social rules. The extended childhood is itself an adaptation, a protected period for acquiring the knowledge that a large, flexible brain requires.

## Ontogenetic vs. deferred adaptations

Some childhood traits are **ontogenetic adaptations** — useful *during* development and then discarded, like the suckling reflex or the rich neural connections of infancy that are later pruned. Others are **deferred adaptations** — features that prepare the child for adult life, like rough-and-tumble play rehearsing later skills. Not everything about a child is just an immature version of an adult.

## Attachment

John Bowlby applied evolutionary thinking to the infant-caregiver bond. **Attachment** is an evolved system that keeps a vulnerable infant close to a protector, with separation triggering distress and reunion bringing comfort. Different attachment styles (secure, anxious, avoidant) can be read as facultative strategies calibrated to the reliability of early caregiving.

## A grounding example

Children's play is not idle. Cross-culturally, young mammals including humans engage in **rough-and-tumble play** and object play that rehearse adult survival and social skills — chasing, fighting, building, and role-taking. Boys' play tends to involve more competitive physical contests and girls' more cooperative and caregiving themes, mirroring ancestral sex-typed activities. The universality and timing of these patterns — peaking before the skills are needed — mark play as a deferred adaptation, practice for a life not yet lived.`,
  },

  // ───────────────────────────────────────────────────────────────
  // Week 3 — Mating and reproduction
  // ───────────────────────────────────────────────────────────────
  {
    slug: "mating-fundamentals",
    title: "Mating fundamentals",
    weekNumber: 3,
    blurb: "Parental investment as the engine of sex differences.",
    lectureTitle: "3.1 Mating fundamentals",
    body: `# Mating fundamentals

Mating is where selection's effects are most visible, because differential reproduction *is* the currency of evolution. The logic of mating begins with a single asymmetry: the unequal cost of reproduction to the two sexes.

## Anisogamy: the original asymmetry

The very definition of the sexes is **anisogamy** — females produce few, large, costly gametes (eggs); males produce many, small, cheap gametes (sperm). This tiny asymmetry at the cellular level cascades upward into nearly everything else about mating behavior.

## Parental investment theory

Robert Trivers generalized the insight: the sex that **invests more** in offspring becomes a limiting resource over which the other sex competes, and the higher-investing sex becomes choosier. In mammals, females invest enormously — gestation, lactation — so females tend to be selective and males tend to compete. Where the pattern reverses (as in seahorses, where males carry the young), so do the behaviors: females compete and males choose.

## Sexual selection follows investment

Because the lower-investing sex competes for the higher-investing sex, the engines of sexual selection — male-male competition and female choice — follow directly from the investment asymmetry. This single framework predicts the direction of choosiness and competitiveness across the animal kingdom.

## A grounding example

Angus Bateman's experiments with fruit flies established the principle now called the **Bateman gradient**: male reproductive success rose steeply with the number of mates, while female success plateaued after just one or two. A male who mated with many females had many more offspring; a female gained little from extra mates because her output was capped by her egg supply. This asymmetric payoff — more mates helps males far more than females — is the quantitative root of why the sexes pursue different mating strategies.`,
  },
  {
    slug: "female-mate-preferences",
    title: "Female mate preferences",
    weekNumber: 3,
    blurb: "Choosing for resources, protection, and good genes.",
    lectureTitle: "3.2 Female mate preferences",
    body: `# Female mate preferences

Because ancestral women bore the heavy costs of reproduction, selection favored women who chose mates carefully. The predicted preferences track the problems a choosing female had to solve: securing resources, protection, and good genes for her children.

## The problems female choice must solve

A woman's reproductive success was historically limited not by the number of mates but by the *quality* of investment she and her offspring received. The recurrent problems were: obtaining resources during pregnancy and lactation, securing protection, ensuring a partner's commitment, and acquiring good genes. Female preferences are tuned to cues that predicted these.

## Resources and status

Across cultures, women on average place more weight than men on a prospective long-term partner's resources, ambition, status, and earning capacity. These are not arbitrary materialism — they are cues to a partner's ability to invest in her and her children over the long haul.

## Good genes and the dual-mating puzzle

Some female preferences seem aimed at genetic quality rather than investment — cues like symmetry, masculinity, and health. The tension between wanting a *good investor* and a *good-genes* mate generates subtle predictions, including shifts in preference across the ovulatory cycle, though the strength of these cycle effects remains debated.

## A grounding example

David Buss's study of mate preferences across 37 cultures — spanning six continents, every major religion, and a wide range of economic systems — found a strikingly consistent pattern: women in nearly every culture rated "good financial prospects," ambition, and somewhat older age in a partner more highly than men did. The cross-cultural universality, in societies as different as Nigeria, Japan, and Sweden, points to an evolved preference rather than a quirk of any one economy or tradition.`,
  },
  {
    slug: "male-mate-preferences",
    title: "Male mate preferences",
    weekNumber: 3,
    blurb: "Cues to fertility and the problem of paternity.",
    lectureTitle: "3.3 Male mate preferences",
    body: `# Male mate preferences

Male reproductive success was historically limited by sexual access to fertile females. Selection therefore favored male preferences attuned to cues of a partner's **fertility** and **reproductive value** — and, for long-term mates, to the problem of paternity certainty.

## Cues to fertility

Because female fertility is strongly age-graded and not directly observable, men evolved preferences for *observable cues* that correlated with fertility: youthfulness, clear skin, lustrous hair, and features associated with health and estrogen. These are signals, not the trait itself — men did not evolve to read fertility directly but to track its visible correlates.

## Reproductive value vs. current fertility

A subtle distinction matters. **Current fertility** is the probability of conceiving now; **reproductive value** is the expected *future* reproductive output. The two peak at slightly different ages. Men seeking short-term mates and men seeking long-term mates weight these differently, which helps explain age-preference patterns.

## The paternity problem

Males face a problem females never do: **paternity uncertainty**. A woman is always certain her child is hers; a man, before modern testing, could not be. This asymmetry shaped male sexual psychology profoundly — including preferences for cues of fidelity in long-term mates and the particular form male jealousy takes, a topic we return to.

## A grounding example

Studies of waist-to-hip ratio by Devendra Singh found that men across many cultures tend to rate a female waist-to-hip ratio around 0.7 as most attractive. This ratio is not arbitrary: it correlates with youth, health, hormonal profile, and the absence of current pregnancy — all cues to fertility. Even when overall body weight preferences vary across cultures, the preference for this *proportion* recurs, suggesting men evolved to track a reliable signal of reproductive potential rather than any single body size.`,
  },
  {
    slug: "short-long-term-strategies",
    title: "Short-term and long-term strategies",
    weekNumber: 3,
    blurb: "A pluralistic menu of conditional mating tactics.",
    lectureTitle: "3.4 Short-term and long-term strategies",
    body: `# Short-term and long-term strategies

Humans do not have one mating strategy; we have a *repertoire*. Sexual strategies theory, developed by David Buss and David Schmitt, holds that both sexes pursue a mix of short-term and long-term mating, deployed conditionally depending on circumstances.

## Two strategies, different problems

**Long-term mating** (committed partnership) and **short-term mating** (brief liaisons) solve different adaptive problems and impose different costs and benefits. They therefore activate different preferences. In short-term contexts, both sexes lower some standards but men especially relax selectivity, while in long-term contexts both sexes raise standards on commitment-relevant traits.

## Strategic interference and deception

Because men and women pursue overlapping but non-identical strategies, conflict arises. **Strategic interference** occurs when one person's strategy blocks another's — for example, when one partner seeks a short-term encounter and the other a long-term bond. This generates the predictable use of deception in courtship, and emotions (like anger and distress) that flag when one's strategy is being thwarted.

## Conditional deployment

Which strategy a person emphasizes depends on factors like sex ratio, their own mate value, the local environment, and life-history calibration. Strategies are facultative — switched on and off by circumstance — not fixed personality types.

## A grounding example

In a famous (and ethically dated) field study by Russell Clark and Elaine Hatfield, attractive strangers approached members of the opposite sex on a college campus and asked one of three questions: go on a date, come to my apartment, or go to bed with me. About half of both sexes agreed to a date. But while *zero percent* of women agreed to sex with a stranger, roughly *seventy-five percent* of men did — a larger fraction than agreed even to the date. The dramatic sex difference in willingness to accept an immediate short-term offer illustrates the divergent payoffs short-term mating historically held for men and women.`,
  },
  {
    slug: "attraction-beauty-fitness-signals",
    title: "Attraction, beauty, and signals of fitness",
    weekNumber: 3,
    blurb: "Why beauty standards are partly universal.",
    lectureTitle: "3.5 Attraction, beauty, and signals of fitness",
    body: `# Attraction, beauty, and signals of fitness

"Beauty is in the eye of the beholder" is half true. Much of attraction is culturally variable, but a surprising core is universal — and the universal core consists of cues that signaled health, fertility, and genetic quality.

## Symmetry

**Fluctuating asymmetry** — small random departures from bilateral symmetry — tends to increase with developmental stress, disease, and mutation load. Symmetry is therefore an honest cue of developmental stability, and across species and cultures, more symmetric faces and bodies tend to be rated more attractive.

## Averageness

Counterintuitively, faces that are *average* — close to the mathematical mean of the population — are rated as more attractive than unusual faces. Composite faces made by averaging many individuals are consistently judged beautiful. Averageness may signal genetic diversity, developmental normality, and the absence of harmful mutations.

## Honest signals and hormone markers

Some attractive features are **hormone markers**: estrogen-dependent features in women and testosterone-dependent features in men (a strong jaw, for instance). Because high testosterone is immunosuppressive, only a healthy male can "afford" to display strongly masculine features — making them an honest, handicap-style signal of quality.

## A grounding example

Judith Langlois demonstrated that the preference for attractive faces is present before culture could install it: infants only a few months old look *longer* at faces adults rate as attractive than at faces rated unattractive. Babies have not learned any beauty standard from magazines or media, yet they already prefer the same faces adults do. This early, pre-cultural agreement points to an evolved face-evaluation mechanism tuned to cues of health and quality.`,
  },
  {
    slug: "jealousy-conflict-mate-retention",
    title: "Jealousy, conflict, and mate retention",
    weekNumber: 3,
    blurb: "Jealousy as an evolved anti-cuckoldry mechanism.",
    lectureTitle: "3.6 Jealousy, conflict, and mate retention",
    body: `# Jealousy, conflict, and mate retention

Acquiring a mate is only half the problem; keeping one is the other half. Jealousy is an evolved emotion designed to detect and counter threats to a valued relationship — and its design reflects the different reproductive threats faced by men and women.

## Jealousy as an adaptation

**Jealousy** is not a malfunction but a mate-guarding mechanism: it is triggered by cues of a partner's potential infidelity and motivates action to prevent or end it. Like fear, it is error-managed — tuned to fire on suspicion because the cost of missing a real betrayal was high.

## The sex difference hypothesis

David Buss proposed that the sexes face different adaptive threats from infidelity. For a man, a partner's *sexual* infidelity risks **cuckoldry** — investing in another man's child. For a woman, a partner's *emotional* infidelity risks the loss of his investment to another woman. The prediction: men are relatively more distressed by sexual infidelity, women relatively more by emotional infidelity.

## Mate retention tactics

People deploy a range of **mate retention behaviors**, from positive (vigilance, attentiveness, gift-giving) to negative (concealment, threats, violence). The intensity tends to track the partner's mate value and perceived risk of defection — and the darker tactics are an important part of understanding intimate partner conflict.

## A grounding example

Buss and colleagues asked people to imagine a partner's sexual infidelity versus emotional infidelity and measured which was more distressing, including via physiological responses like heart rate and skin conductance. Men showed greater physiological distress to imagined *sexual* infidelity, while women showed greater distress to imagined *emotional* infidelity. Although the size and universality of the effect are debated, the patterned sex difference — predicted in advance from paternity uncertainty versus investment loss — is exactly what an evolutionary account anticipates.`,
  },
  {
    slug: "parental-investment-parenting",
    title: "Parental investment and parenting",
    weekNumber: 3,
    blurb: "Why parents invest, and why conflict is built in.",
    lectureTitle: "3.7 Parental investment and parenting",
    body: `# Parental investment and parenting

Reproduction is not finished at conception or even birth. In humans, the bulk of the reproductive task is *parenting* — and selection shaped both the depth of parental love and the surprising conflicts that run through families.

## Why parents invest

Parental care is an inclusive-fitness investment: a child carries half of each parent's genes ($r = 1/2$), so helping the child reproduce propagates the parent's genes. The intensity of parental love — among the strongest human motivations — is the proximate machinery of this ultimate logic.

## Discriminative parental solicitude

Parental investment is not unconditional; it is **discriminative**, allocated according to cues of the offspring's relatedness, health, and reproductive prospects. Investment tends to rise with certainty of parentage and with the child's likelihood of surviving and reproducing. This explains why, tragically, risk factors for child maltreatment include stepparenthood and severe child disability — patterns that make grim sense in light of investment logic, though they never justify the behavior.

## Parent-offspring conflict

Trivers's **parent-offspring conflict** theory shows that families are not perfectly harmonious. A child is related to itself by $r = 1$ but to a sibling by only $r = 1/2$, so a child is selected to demand *more* investment than the parent — equally related to all offspring — is selected to give. The resulting tug-of-war begins in the womb and continues through weaning conflict and sibling rivalry.

## A grounding example

Martin Daly and Margo Wilson examined child homicide and abuse records and found that the presence of a stepparent in the home was associated with a dramatically elevated risk to children compared with two genetic parents — a pattern they called the "Cinderella effect." A stepparent lacks the genetic stake that drives discriminative solicitude. The finding is sobering, and the evolutionary lens does not excuse it; rather, it predicts where vulnerability concentrates, information that can guide protection.`,
  },

  // ───────────────────────────────────────────────────────────────
  // Week 4 — Social life, cooperation, and culture
  // ───────────────────────────────────────────────────────────────
  {
    slug: "kinship-family-dynamics",
    title: "Kinship and family dynamics",
    weekNumber: 4,
    blurb: "Genetic relatedness as the architecture of the family.",
    lectureTitle: "4.1 Kinship and family dynamics",
    body: `# Kinship and family dynamics

Family is the original social world. The structure of kin relationships — who helps whom, who competes with whom — is largely organized by the logic of genetic relatedness we met in Hamilton's rule.

## Kin altruism in everyday life

Inclusive fitness predicts a gradient of helping that tracks relatedness, and the data broadly agree: people give more help, more often, to closer kin, especially in life-or-death situations. Bequests, organ donations, and risky rescues all skew toward close relatives. Kinship is the deepest reservoir of human cooperation.

## Kin recognition

To direct help toward kin, an organism must *identify* kin. Humans use cues such as **co-residence during childhood**, maternal association, and facial resemblance. These cues are usually reliable but can be fooled — which is why we feel familial warmth toward people we were merely raised with.

## The grandmother hypothesis

Humans are unusual in having a long post-reproductive lifespan, especially in women. The **grandmother hypothesis** proposes that menopause and longevity evolved because older women could raise their inclusive fitness more by helping provision grandchildren than by continuing to reproduce themselves — a striking case of indirect fitness shaping the human lifespan.

## A grounding example

The **Westermarck effect** is kin recognition caught misfiring. Children raised in close physical proximity during the first years of life develop a sexual aversion to one another, an evolved incest-avoidance mechanism using co-residence as a kinship cue. Studies of Israeli kibbutzim — where unrelated children were raised together communally — found that these peers almost never married each other, despite no rule against it. The co-residence cue triggered the aversion even though the children were not actually related, revealing the cue-based machinery behind incest avoidance.`,
  },
  {
    slug: "cooperation-reciprocal-altruism",
    title: "Cooperation and reciprocal altruism",
    weekNumber: 4,
    blurb: "How cooperation among non-kin evolves and stays stable.",
    lectureTitle: "4.2 Cooperation and reciprocal altruism",
    body: `# Cooperation and reciprocal altruism

Kin selection explains helping relatives. But humans cooperate extensively with non-relatives — friends, trading partners, strangers. Explaining this required a second mechanism: reciprocity.

## Reciprocal altruism

Robert Trivers showed that altruism toward non-kin can evolve if it is **reciprocated**: I help you now, you help me later, and both of us end up better off than two non-cooperators. The condition is repeated interaction among individuals who can recognize each other and remember past dealings.

## The prisoner's dilemma and tit-for-tat

The problem of cooperation is captured by the **prisoner's dilemma**, where each individual is tempted to defect even though mutual cooperation pays better. In Robert Axelrod's famous tournaments, the winning strategy was **tit-for-tat**: cooperate first, then do whatever your partner did last. It is nice, retaliatory, forgiving, and clear — and it stabilizes cooperation among self-interested agents.

## Cheater detection and the social emotions

Reciprocity is vulnerable to free-riders, so selection equipped us to police it. We have sharp **cheater-detection** abilities (recall the Wason task), and a suite of social emotions enforce the system: gratitude rewards cooperators, anger and the urge to punish deter defectors, and guilt repairs ruptured relationships. Trust and reputation become valuable currencies.

## A grounding example

Gerald Wilkinson documented reciprocal altruism in vampire bats. A bat that fails to feed on a given night will die within days, but a successful bat can regurgitate blood to share. Bats preferentially share with those who have shared with them in the past, and they remember individual partners. This is reciprocal altruism in a non-human animal: repeated interaction, individual recognition, and help contingent on past cooperation — exactly Trivers's conditions.`,
  },
  {
    slug: "aggression-status-dominance",
    title: "Aggression, status, and dominance",
    weekNumber: 4,
    blurb: "Aggression as a context-sensitive strategy.",
    lectureTitle: "4.3 Aggression, status, and dominance",
    body: `# Aggression, status, and dominance

Aggression is not a senseless drive but a strategy — costly and dangerous, deployed when its expected payoff exceeded its expected cost. Understanding *when* it pays clarifies the patterns of human violence.

## Aggression as strategy

Selection would never favor indiscriminate violence; fighting risks injury and death. Instead it favors **conditional aggression**, calibrated to context: the value of the contested resource, the probability of winning, and the costs of losing. Animals (and people) assess these factors and usually settle conflicts through displays and assessment rather than escalating to combat.

## The young male syndrome

Daly and Wilson described the **young male syndrome**: risk-taking and violence peak in young men, precisely the demographic that historically faced the fiercest competition for status and mates and had the least to lose. Homicide statistics across virtually every society show the same age-sex signature — a curve that bends sharply upward in young adulthood for men.

## Status and dominance vs. prestige

Humans pursue rank through two routes. **Dominance** is status taken by force and intimidation; **prestige** is status freely conferred because of valued skills or knowledge. Both raise reproductive prospects, but prestige is the distinctively human route, built on the value others place on learning from the skilled.

## A grounding example

Daly and Wilson analyzed homicides and found that a large share of male-male killings arose from seemingly "trivial" altercations — insults, status challenges, disputes over face in front of others. To an outsider the stakes look absurdly small. But in the ancestral world, a reputation for not tolerating disrespect deterred future exploitation, and status translated into mating opportunity. The "trivial" trigger is a status contest, and status was anything but trivial for a young man's reproductive future.`,
  },
  {
    slug: "coalitions-groups-warfare",
    title: "Coalitions, groups, and warfare",
    weekNumber: 4,
    blurb: "The psychology of us-versus-them.",
    lectureTitle: "4.4 Coalitions, groups, and warfare",
    body: `# Coalitions, groups, and warfare

Humans are intensely group-living. We form alliances, mark group boundaries, and sometimes wage coordinated violence against other groups. The psychology behind coalitions is some of the most consequential — and dangerous — of our evolved equipment.

## Coalitional psychology

Ancestral life made **coalitions** — cooperative alliances — a route to resources, defense, and status. Selection therefore built a psychology for detecting alliances, tracking who is on whose side, and signaling group membership. We are exquisitely sensitive to coalitional cues, sometimes to a fault.

## Ingroup and outgroup

Coalitional psychology generates the **ingroup/outgroup** distinction: cooperation and trust extended to "us," suspicion and competition directed at "them." Importantly, the categories that define groups are *flexible* — selection did not build us to track any particular marker but to detect whatever currently predicts alliance.

## The intergroup-conflict logic

Coordinated intergroup violence appears in chimpanzees and across human societies. Models suggest it can pay when an aggressor coalition can attack with low risk to itself — the "imbalance of power" condition, where overwhelming numerical advantage makes lethal raiding cheap. Much human warfare psychology, including in-group loyalty and out-group dehumanization, can be read through this lens.

## A grounding example

Robert Kurzban, John Tooby, and Leda Cosmides tested whether race is a fixed category in the mind or a stand-in for coalition. Participants watched members of two mixed-race teams argue; the experimenters measured whether observers automatically encoded each speaker's *race* or their *team*. When clothing and context made team membership salient, observers' tendency to categorize by race *dropped sharply* — they tracked coalition instead. The finding suggests the mind does not have a dedicated "race module"; rather, it has a coalition-detector that latches onto race only when race happens to predict alliance, and lets go when something better does.`,
  },
  {
    slug: "language-communication",
    title: "Language and communication",
    weekNumber: 4,
    blurb: "Language as an evolved instinct.",
    lectureTitle: "4.5 Language and communication",
    body: `# Language and communication

Language is the most distinctive human trait and a prime candidate for a complex adaptation. The evidence that it is an evolved instinct — rather than a mere cultural invention — is strong and worth examining carefully.

## The language instinct

Noam Chomsky argued, and Steven Pinker popularized, that language is an **instinct**: a species-typical, specialized capacity that develops on a predictable schedule with minimal explicit teaching. Children acquire grammar rapidly, in a fixed sequence, and generate novel sentences they have never heard — making errors (like "goed" and "foots") that reveal they are extracting rules, not just imitating.

## The poverty of the stimulus

A central argument is the **poverty of the stimulus**: the language children hear is too sparse and error-ridden to account for the rich, rule-governed grammar they acquire. The gap implies the child brings innate structure — a universal grammar — to the task. Learning fills in parameters; it does not build the system from scratch.

## Design features and honest communication

Language has hallmarks of designed communication: it is *digital* (discrete words combined by rules), *generative* (infinite expressions from finite means), and *displaced* (it can refer to the absent, the past, and the hypothetical). But communication poses an evolutionary puzzle — why be honest? Signaling theory and the policing of reputation help explain why language is reliable enough to be useful.

## A grounding example

Studies of **creolization** show language structure emerging in a single generation. When children are exposed to a **pidgin** — a makeshift, grammarless contact language thrown together by adults with no common tongue — they spontaneously transform it into a **creole**, a full language with consistent grammar, complete with tense, agreement, and word order that the pidgin lacked. Derek Bickerton documented this in plantation communities, and Judy Kegl observed it as deaf Nicaraguan children, given only crude home signs, generated a fully grammatical sign language on their own. Children do not just learn language; given impoverished input, they *create* its missing structure — exactly what an innate language faculty predicts.`,
  },
  {
    slug: "emotions-evolved-programs",
    title: "Emotions as evolved programs",
    weekNumber: 4,
    blurb: "Emotions as coordinating superordinate programs.",
    lectureTitle: "4.6 Emotions as evolved programs",
    body: `# Emotions as evolved programs

Emotions can seem like the opposite of rational design — messy, disruptive, irrational. The evolutionary view inverts this: emotions are sophisticated programs that coordinate the whole organism to meet recurrent adaptive challenges.

## Emotions as superordinate programs

Cosmides and Tooby describe an emotion as a **superordinate program** that orchestrates many subsystems at once. When fear is triggered, it simultaneously redirects attention, sharpens perception, shifts physiology (heart rate, hormones), reprioritizes goals, and biases memory and decision-making. Each emotion is a coordinated mode of operation matched to a class of situation — threat, loss, contamination, betrayal.

## Universality of basic emotions

Paul Ekman's research found that certain facial expressions of emotion — happiness, sadness, anger, fear, disgust, surprise — are recognized across radically different cultures, including peoples with no exposure to Western media. The cross-cultural consistency of both producing and reading these expressions argues for an evolved, species-typical emotional repertoire.

## Emotions as commitment devices

Some emotions function as **commitment devices** that solve problems pure rationality cannot. Romantic love commits a partner beyond cold calculation; a credible capacity for vengeful anger deters exploitation precisely because it is *not* coolly cost-benefit. By making us behave in ways a pure short-term maximizer would not, emotions can secure long-term gains.

## A grounding example

Ekman traveled to the Fore people of Papua New Guinea, a then-isolated population with no exposure to outside media. He told them simple stories ("this person's child has died," "this person sees something that smells bad") and asked them to match the story to a photograph of a Western face. The Fore reliably picked the same expressions Westerners would — sadness for the dead child, disgust for the bad smell — and Western observers could likewise read Fore expressions. This mutual, cross-cultural legibility of emotional faces, in a population that could not have learned them from us, is powerful evidence that basic emotions are evolved rather than culturally invented.`,
  },
  {
    slug: "culture-religion-evolved-mind",
    title: "Culture, religion, and the evolved mind",
    weekNumber: 4,
    blurb: "How an evolved mind generates and constrains culture.",
    lectureTitle: "4.7 Culture, religion, and the evolved mind",
    body: `# Culture, religion, and the evolved mind

Culture is sometimes set against biology, as if the two were rivals. The evolutionary view dissolves the opposition: culture is generated, transmitted, and constrained by evolved minds, and it co-evolves with our genes.

## Evoked vs. transmitted culture

Tooby and Cosmides distinguish **evoked culture** — variation produced when a *universal* psychology meets different local conditions (different environments evoke different responses from the same programs) — from **transmitted culture** — ideas and practices passed from mind to mind by learning. Both depend on evolved psychology: the first as the program, the second as the learning machinery.

## Gene-culture coevolution

Genes and culture shape each other. A cultural practice (dairying) can create a selection pressure that changes gene frequencies (lactase persistence), and evolved biases shape which cultural variants spread. Humans are the great imitators, equipped with biases to copy the successful, the prestigious, and the majority — biases that make cumulative culture possible.

## The byproduct theory of religion

Religion is widespread but puzzling. One influential account treats religious belief as a **byproduct** of ordinary cognitive systems: a hyperactive agency-detection device (we see intentions everywhere), a theory of mind that can imagine disembodied minds, and a tendency toward dualism. **Minimally counterintuitive** concepts — a person who is invisible, a statue that hears prayers — are especially memorable and transmissible. Other researchers argue religion also has adaptive functions, promoting cooperation and group cohesion.

## A grounding example

Cross-culturally, the gods people most invest in tend to be **morally concerned** and to *care about how people treat one another*. Ara Norenzayan's "big gods" research argues that belief in powerful, watchful, punishing deities expanded as societies grew, because the sense of being constantly observed by a moralizing god promoted honesty and cooperation among strangers — relationships too large and anonymous for reciprocity and reputation alone to police. Whether byproduct, adaptation, or both, religion is built out of, and constrained by, the standard equipment of the evolved mind.`,
  },
  {
    slug: "capstone-synthesis",
    title: "Capstone synthesis",
    weekNumber: 4,
    blurb: "Pulling the framework together; promise and limits.",
    lectureTitle: "4.8 Capstone synthesis",
    body: `# Capstone synthesis

We began with a single idea — the mind is a product of natural selection — and followed it from the logic of the gene to the structure of the family, the dynamics of mating, and the architecture of culture. This final lecture pulls the threads together and faces the field's hardest questions honestly.

## The unifying framework

Every topic in this course flows from a few principles. Selection builds **functional design** to solve **recurrent adaptive problems**. The mind is therefore a set of **specialized, conditional programs** ("if-then" mechanisms sensitive to context). These programs maximize **inclusive fitness**, often producing behavior that is generous, emotional, or self-sacrificing rather than coldly selfish. And they were tuned to an **ancestral environment** that often differs from our own, producing predictable **mismatches**.

## Recurring tools of reasoning

Notice the analytical moves we used again and again: distinguishing **proximate from ultimate** causes; applying **Hamilton's rule** $rB > C$ to social behavior; invoking **parental investment** to predict sex differences; using **error management** to explain biased mechanisms (fear, disgust, jealousy); and separating **adaptation from byproduct from noise**. These tools generalize far beyond the examples here.

## The limits and the future

The field has real challenges. Reconstructing the ancestral past is hard, and "just-so stories" — plausible but untested adaptive guesses — are a genuine hazard. Good evolutionary psychology answers this with *a priori* predictions, cross-cultural tests, and convergent evidence from genetics, neuroscience, and the archaeological record, rather than after-the-fact storytelling. The strongest findings in this course were predicted *before* they were measured.

## A grounding example

Return to the very first example: our craving for sweet and fatty food. In one lecture it illustrated adaptation; now it can showcase the whole framework. It is **functional design** (a nutrient-detection system), shaped by a **recurrent problem** (calorie scarcity), expressed as a **conditional program** (we crave more when deprived), serving **fitness** in the ancestral past, and now generating a **mismatch** (obesity in a world of abundance) that we understand through the **proximate** machinery of taste and the **ultimate** logic of selection — *without* committing the **naturalistic fallacy** of calling the craving good. One humble example, read through the entire toolkit. That is the method of evolutionary psychology.`,
  },
];

type SeedAssignment = {
  kind: "homework" | "test" | "midterm" | "final";
  title: string;
  weekNumber: number;
  isTimed: boolean;
  timeLimitMinutes: number | null;
  instructions: string;
  problems: Array<{
    topicSlug: string;
    prompt: string;
    correctAnswer: string;
    explanation: string;
    hint?: string;
  }>;
};

const ASSIGNMENTS: SeedAssignment[] = [
  // ───────────── Week 1 ─────────────
  {
    kind: "homework",
    title: "Homework 1.1 — Selection, adaptation, and the gene",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Short-answer problems on the foundations: what the field claims, how selection works, and the gene's-eye view. Answer in your own words; precise use of the key terms matters.",
    problems: [
      {
        topicSlug: "evopsych-what-why",
        prompt:
          "State the central claim of evolutionary psychology about the architecture of the mind in one sentence.",
        correctAnswer:
          "The mind is a set of evolved, specialized information-processing mechanisms shaped by natural selection to solve recurrent ancestral adaptive problems.",
        explanation:
          "Cosmides and Tooby's core thesis: the brain is an organ built by selection, composed of many domain-specific programs rather than one general-purpose computer.",
      },
      {
        topicSlug: "natural-selection-adaptation",
        prompt:
          "Name the three conditions that must hold for natural selection to operate.",
        correctAnswer: "Variation, heritability, and differential reproduction.",
        explanation:
          "Darwin's logic needs only these three: individuals vary, some variation is inherited, and some variants out-reproduce others. Their conjunction necessarily produces adaptive change.",
        hint: "Think about what must differ, what must be passed on, and what must differ in outcome.",
      },
      {
        topicSlug: "genes-inheritance-replication",
        prompt:
          "In Dawkins's framework, what is the difference between a replicator and a vehicle, and which are genes versus organisms?",
        correctAnswer:
          "A replicator copies itself (the gene); a vehicle carries replicators and interacts with the world (the organism).",
        explanation:
          "Genes are the replicators that persist across generations; bodies are temporary vehicles built to propagate the genes they carry.",
      },
      {
        topicSlug: "natural-selection-adaptation",
        prompt:
          "Define what makes a trait an 'adaptation,' and name its defining signature.",
        correctAnswer:
          "An adaptation is a trait that exists because it solved a recurrent ancestral reproductive problem; its signature is complex functional design (improbable, coordinated machinery suited to a task).",
        explanation:
          "Functional design — many parts working together for a specific function — is the hallmark that distinguishes adaptations from byproducts and noise.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 1.2 — Sexual selection, kin selection, modularity",
    weekNumber: 1,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Apply Hamilton's rule and the logic of sexual selection and modularity. Where a formula is requested, write it out.",
    problems: [
      {
        topicSlug: "inclusive-fitness-kin-selection",
        prompt:
          "Write Hamilton's rule as an inequality and define each of its three terms.",
        correctAnswer:
          "rB > C, where r is the coefficient of relatedness, B is the reproductive benefit to the recipient, and C is the cost to the actor.",
        explanation:
          "An altruistic act is favored by selection when the benefit to the recipient, weighted by relatedness, exceeds the cost to the actor: $rB > C$.",
        hint: "It relates relatedness, benefit, and cost.",
      },
      {
        topicSlug: "inclusive-fitness-kin-selection",
        prompt:
          "Give the coefficient of relatedness (r) between (a) full siblings and (b) first cousins.",
        correctAnswer: "(a) r = 1/2 for full siblings; (b) r = 1/8 for first cousins.",
        explanation:
          "Full siblings share half their genes on average ($r = 1/2$); first cousins share an eighth ($r = 1/8$).",
      },
      {
        topicSlug: "sexual-selection",
        prompt:
          "Name the two mechanisms of sexual selection and briefly distinguish them.",
        correctAnswer:
          "Intrasexual selection (same-sex competition for mates, e.g., male-male combat) and intersexual selection (mate choice, e.g., female choice of ornamented males).",
        explanation:
          "Sexual selection operates through competition within a sex and through choice by the other sex; both can build costly traits like antlers and ornaments.",
      },
      {
        topicSlug: "adapted-mind-modularity",
        prompt:
          "Why does evolutionary psychology predict a modular, domain-specific mind rather than one general-purpose problem-solver?",
        correctAnswer:
          "Because different adaptive problems require different solutions, a mechanism tuned to one problem would fail at others, so selection favors many specialized mechanisms each carrying built-in knowledge of its domain.",
        explanation:
          "A single general engine cannot embody the conflicting optimal rules of mating, foraging, and predator-avoidance at once; specialization outperforms generality.",
      },
    ],
  },
  {
    kind: "test",
    title: "Week 1 Test — Foundations",
    weekNumber: 1,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions:
      "Timed. 30 minutes. Pasting is disabled. Answer in clear, compact prose using the field's terminology precisely.",
    problems: [
      {
        topicSlug: "levels-of-explanation",
        prompt:
          "Distinguish a proximate explanation from an ultimate explanation, and give one example of each for the same behavior.",
        correctAnswer:
          "A proximate explanation cites immediate mechanism (e.g., a mother nurtures her baby because of oxytocin); an ultimate explanation cites evolutionary function (e.g., because caring for offspring propagated her genes).",
        explanation:
          "Proximate = how it works now; ultimate = why selection built it. They are complementary answers to different questions, not rivals.",
      },
      {
        topicSlug: "levels-of-explanation",
        prompt:
          "Name and define the naturalistic fallacy, and explain in one sentence why evolutionary psychology is not committed to it.",
        correctAnswer:
          "The naturalistic fallacy is inferring 'ought' from 'is' — assuming whatever evolved is therefore good; evolutionary psychology only describes why tendencies exist and never claims they are morally justified.",
        explanation:
          "Explaining the origin of a behavior (violence, deception) is not endorsing it; description is not prescription.",
      },
      {
        topicSlug: "natural-selection-adaptation",
        prompt:
          "Distinguish an adaptation from a byproduct, giving one example of a byproduct.",
        correctAnswer:
          "An adaptation was selected for its function; a byproduct rides along with an adaptation without being selected itself (e.g., the whiteness of bone is a byproduct of calcium).",
        explanation:
          "Not every trait is an adaptation. Byproducts lack their own functional design; they are side effects of features that were selected.",
        hint: "One was selected for a job; the other is a side effect.",
      },
      {
        topicSlug: "sexual-selection",
        prompt:
          "State the handicap principle and explain why a costly ornament is an honest signal.",
        correctAnswer:
          "The handicap principle holds that a signal is reliable because it is costly: only a high-quality individual can afford to produce or carry it, so the cost guarantees honesty.",
        explanation:
          "A peacock's huge tail is honest precisely because a sickly bird could not survive while bearing it; cost prevents faking.",
      },
      {
        topicSlug: "adapted-mind-modularity",
        prompt:
          "Describe what the Wason selection task reveals about the structure of human reasoning.",
        correctAnswer:
          "People fail abstract logic versions but succeed when the same logic is framed as detecting cheaters in a social contract, revealing a specialized cheater-detection mechanism rather than a single general logic engine.",
        explanation:
          "Content matters: identical logical structure is solved easily in a social-exchange frame, evidence for a domain-specific reasoning module.",
      },
    ],
  },

  // ───────────── Week 2 ─────────────
  {
    kind: "homework",
    title: "Homework 2.1 — Survival, food, and fear",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Short-answer problems on the survival mechanisms of the evolved individual.",
    problems: [
      {
        topicSlug: "survival-evolved-body",
        prompt:
          "What is the environment of evolutionary adaptedness (EEA), and why does it matter for understanding modern maladaptive behavior?",
        correctAnswer:
          "The EEA is the statistical composite of ancestral conditions (largely the Pleistocene) to which our mechanisms were tuned; it matters because today's environment differs, causing once-adaptive mechanisms to misfire (mismatch).",
        explanation:
          "Cravings for sugar, salt, and rest were adaptive under ancestral scarcity but cause harm amid modern abundance — a mismatch between the EEA and now.",
      },
      {
        topicSlug: "foraging-food-palate",
        prompt:
          "Explain why humans evolved strong preferences for sweet and fatty foods.",
        correctAnswer:
          "Sweet signaled ripe fruit and quick energy, and fat was a rare, calorie-dense resource; under ancestral calorie scarcity, a taste system that rewarded eating them was favored by selection.",
        explanation:
          "Taste is an evolved nutrient-detection system; the preference was adaptive when calories were scarce, even though it harms us amid abundance.",
      },
      {
        topicSlug: "fear-predators-threat-detection",
        prompt:
          "Define a 'prepared fear' and give two examples.",
        correctAnswer:
          "A prepared fear is one humans acquire readily because it tracked ancestral dangers; examples include fear of snakes, spiders, heights, or the dark.",
        explanation:
          "Prepared fears target ancestral threats, not modern statistical dangers like cars — which is why they are learned so easily and persist.",
        hint: "Think of dangers common in the ancestral world, not the modern one.",
      },
      {
        topicSlug: "fear-predators-threat-detection",
        prompt:
          "State error management theory and use it to explain why the fear system produces many false alarms.",
        correctAnswer:
          "Error management theory holds that when the costs of two error types are unequal, selection biases the system toward the cheaper error; fear over-fires because a false alarm (fleeing a stick) is far cheaper than a missed real threat (ignoring a snake).",
        explanation:
          "Like a smoke detector, the fear system is tuned to over-react because false negatives were potentially fatal while false positives were trivial.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 2.2 — Habitat, disease, and life history",
    weekNumber: 2,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Short-answer problems on habitat cognition, the behavioral immune system, and life history theory.",
    problems: [
      {
        topicSlug: "disease-avoidance-immune-system",
        prompt:
          "What is the behavioral immune system, and what emotion is its main driver?",
        correctAnswer:
          "It is a suite of psychological mechanisms that detect cues of infection and motivate avoidance, driven mainly by disgust.",
        explanation:
          "It is a cheap, early line of defense that helps us avoid pathogens before they enter the body, in contrast to the costly biological immune system.",
      },
      {
        topicSlug: "life-history-theory",
        prompt:
          "Name the three central trade-offs studied by life history theory.",
        correctAnswer:
          "Current vs. future reproduction; quantity vs. quality of offspring; and mating effort vs. parenting effort.",
        explanation:
          "Because time and energy are finite, investment in one function comes at the expense of another; the optimal balance depends on the environment.",
      },
      {
        topicSlug: "life-history-theory",
        prompt:
          "Contrast a 'fast' and a 'slow' life history strategy and name the kind of environment that favors each.",
        correctAnswer:
          "Fast: mature early, reproduce young, many offspring, low investment — favored by harsh, unpredictable, high-mortality environments. Slow: mature late, reproduce later, few offspring, high investment — favored by stable, safe environments.",
        explanation:
          "Environments calibrate where organisms fall on the fast–slow continuum; humans are overall slow but shift based on early-life cues.",
        hint: "One responds to danger and unpredictability, the other to stability.",
      },
      {
        topicSlug: "habitat-preferences-cognition",
        prompt:
          "State the savanna hypothesis and one piece of evidence offered for it.",
        correctAnswer:
          "The savanna hypothesis proposes an evolved human preference for savanna-like habitats (open grassland with trees and water); evidence includes cross-cultural preference for such landscapes, strongest in young children.",
        explanation:
          "The preference's appearance before much cultural shaping (in children) is taken as evidence it is evolved rather than learned.",
      },
    ],
  },
  {
    kind: "midterm",
    title: "Midterm — Foundations and the evolved individual",
    weekNumber: 2,
    isTimed: true,
    timeLimitMinutes: 45,
    instructions:
      "Timed. 45 minutes. Cumulative over Weeks 1–2. Pasting is disabled. Answer precisely and concisely.",
    problems: [
      {
        topicSlug: "inclusive-fitness-kin-selection",
        prompt:
          "Define inclusive fitness, distinguishing its direct and indirect components.",
        correctAnswer:
          "Inclusive fitness is an organism's total genetic contribution to future generations: direct fitness (its own offspring) plus indirect fitness (its effect on relatives' reproduction, weighted by relatedness).",
        explanation:
          "Selection maximizes inclusive fitness, not mere personal survival or even personal reproduction — which is why helping kin can be favored.",
      },
      {
        topicSlug: "evopsych-what-why",
        prompt:
          "List Tinbergen's four questions (the four levels of explanation for any trait).",
        correctAnswer:
          "Mechanism (how it works), development (how it grows in the individual), function (what it was selected for), and phylogeny (its evolutionary history).",
        explanation:
          "Tinbergen's framework shows that mechanism, development, function, and phylogeny are complementary levels — evolutionary psychology specializes in function.",
        hint: "Two are about the present individual; two are about evolutionary origins.",
      },
      {
        topicSlug: "disease-avoidance-immune-system",
        prompt:
          "Explain why pregnant women in the first trimester tend to show heightened disgust and food aversions, in evolutionary terms.",
        correctAnswer:
          "In the first trimester the immune system is suppressed and the embryo is most vulnerable to toxins and pathogens, so heightened disgust provides extra behavioral pathogen avoidance exactly when the need is greatest.",
        explanation:
          "The behavioral immune system is dialed up when the body is most at risk — an adaptive compensation for the suppressed biological defenses of early pregnancy.",
      },
      {
        topicSlug: "foraging-food-palate",
        prompt:
          "Describe the Garcia effect (one-trial taste aversion) and what it shows about the specialization of learning.",
        correctAnswer:
          "After a single bout of nausea following a novel flavor — even hours later — animals and humans avoid that flavor for life, showing that food-aversion learning is specialized (delayed, single-trial, and able to override conscious belief) rather than following general learning rules.",
        explanation:
          "The Garcia effect violates ordinary timing rules of learning, revealing an evolved poison-avoidance system tuned to the structure of the food-toxin problem.",
      },
      {
        topicSlug: "survival-evolved-body",
        prompt:
          "Explain why it is more accurate to say organisms are designed to reproduce than to survive, with one illustration.",
        correctAnswer:
          "Survival is only a means to reproduction, so selection trades survival for reproduction when it pays — e.g., salmon die after spawning, and young human males take fitness-relevant risks; mechanisms serve lifetime reproductive success, not longevity.",
        explanation:
          "Because reproduction is the currency of selection, longevity is sacrificed whenever doing so raises reproductive output.",
      },
    ],
  },

  // ───────────── Week 3 ─────────────
  {
    kind: "homework",
    title: "Homework 3.1 — The logic of mating and mate preferences",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Short-answer problems on the foundations of mating and on female and male preferences.",
    problems: [
      {
        topicSlug: "mating-fundamentals",
        prompt:
          "State parental investment theory's central prediction about which sex becomes choosier and which competes.",
        correctAnswer:
          "The sex that invests more in offspring becomes the limiting resource and is choosier; the lower-investing sex competes for access to the higher-investing sex.",
        explanation:
          "Trivers's theory: in mammals females invest more (gestation, lactation), so females are choosy and males compete; the pattern reverses where male investment is higher.",
        hint: "Think about who pays the higher cost of reproduction.",
      },
      {
        topicSlug: "mating-fundamentals",
        prompt:
          "What is anisogamy, and why is it considered the root asymmetry underlying sex differences in mating?",
        correctAnswer:
          "Anisogamy is the difference in gamete size — females produce few large costly eggs, males many small cheap sperm; this cellular asymmetry cascades into the differing mating strategies of the sexes.",
        explanation:
          "The unequal minimum investment set by gamete size is the starting point from which parental investment and sexual selection differences follow.",
      },
      {
        topicSlug: "female-mate-preferences",
        prompt:
          "Why does selection predict that women, on average, weight a long-term partner's resources and status more than men do?",
        correctAnswer:
          "Because ancestral women bore the heavy costs of reproduction and their success depended on the investment they and their offspring received; resources and status are cues to a partner's ability to provide that investment.",
        explanation:
          "The preference tracks ancestral provisioning problems during pregnancy and lactation, not arbitrary materialism.",
      },
      {
        topicSlug: "male-mate-preferences",
        prompt:
          "Explain why men evolved preferences for observable cues like youthfulness and clear skin rather than 'fertility' directly.",
        correctAnswer:
          "Fertility is not directly observable, so selection favored preferences for observable cues (youth, clear skin, healthy features) that reliably correlated with fertility in the ancestral environment.",
        explanation:
          "Men did not evolve to read fertility itself but to track its visible correlates; e.g., a waist-to-hip ratio near 0.7 is one such cue.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 3.2 — Strategies, beauty, jealousy, parenting",
    weekNumber: 3,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Short-answer problems on sexual strategies, attraction, jealousy, and parental investment.",
    problems: [
      {
        topicSlug: "short-long-term-strategies",
        prompt:
          "What does it mean to say human mating strategies are 'pluralistic' and 'conditional'?",
        correctAnswer:
          "Humans have a repertoire of both short-term and long-term strategies that are deployed facultatively depending on circumstances (sex ratio, mate value, environment), rather than one fixed strategy.",
        explanation:
          "Sexual strategies theory holds that the same person can pursue different strategies depending on context; they are switched on and off by circumstance.",
      },
      {
        topicSlug: "attraction-beauty-fitness-signals",
        prompt:
          "Why is bilateral symmetry considered an honest cue of mate quality?",
        correctAnswer:
          "Because fluctuating asymmetry increases with developmental stress, disease, and mutation load, symmetry honestly signals developmental stability and good genes.",
        explanation:
          "Only an organism that developed without much disruption ends up symmetric, so symmetry cannot easily be faked.",
        hint: "Consider what tends to make a body develop less symmetrically.",
      },
      {
        topicSlug: "jealousy-conflict-mate-retention",
        prompt:
          "State Buss's sex-difference hypothesis about jealousy and the adaptive logic behind it.",
        correctAnswer:
          "Men are predicted to be relatively more distressed by a partner's sexual infidelity (risk of cuckoldry) and women relatively more by emotional infidelity (risk of losing his investment), reflecting paternity uncertainty versus investment loss.",
        explanation:
          "The two sexes faced different reproductive threats from infidelity, so jealousy is predicted to be tuned to different cues.",
      },
      {
        topicSlug: "parental-investment-parenting",
        prompt:
          "Explain Trivers's parent-offspring conflict: why are families not perfectly harmonious?",
        correctAnswer:
          "A child is related to itself by r = 1 but to a sibling by only r = 1/2, so it is selected to demand more investment than the parent — equally related to all offspring — is selected to give, producing conflict (e.g., weaning conflict).",
        explanation:
          "Because relatedness differs between the child's perspective and the parent's, their genetic interests over investment do not perfectly coincide.",
      },
    ],
  },
  {
    kind: "test",
    title: "Week 3 Test — Mating and reproduction",
    weekNumber: 3,
    isTimed: true,
    timeLimitMinutes: 30,
    instructions:
      "Timed. 30 minutes. Pasting is disabled. Answer precisely using the course's terminology.",
    problems: [
      {
        topicSlug: "mating-fundamentals",
        prompt:
          "What is the Bateman gradient, and what does its sex difference imply about mating strategies?",
        correctAnswer:
          "The Bateman gradient describes how reproductive success rises with number of mates; it is steep for males and flat for females, implying extra mates benefit males far more, which underlies divergent mating strategies.",
        explanation:
          "Bateman's fruit-fly experiments showed male success climbed with mate number while female success plateaued — the quantitative root of sex differences in mating effort.",
      },
      {
        topicSlug: "short-long-term-strategies",
        prompt:
          "Describe the Clark and Hatfield study result and what it illustrates about sex differences in short-term mating.",
        correctAnswer:
          "Attractive strangers offered a date, an apartment visit, or sex; about half of both sexes accepted a date, but roughly 75% of men yet 0% of women agreed to immediate sex, illustrating the divergent payoffs of short-term mating.",
        explanation:
          "The large sex difference in willingness to accept an immediate sexual offer reflects the different ancestral costs and benefits of short-term mating.",
      },
      {
        topicSlug: "attraction-beauty-fitness-signals",
        prompt:
          "Why are 'average' faces (composites) typically rated as more attractive, in evolutionary terms?",
        correctAnswer:
          "Averageness may signal genetic diversity, developmental normality, and the absence of harmful mutations, so a preference for average features tracks cues of health and good genes.",
        explanation:
          "Composite faces near the population mean are consistently judged attractive, consistent with averageness as a fitness cue.",
      },
      {
        topicSlug: "parental-investment-parenting",
        prompt:
          "What is the 'Cinderella effect,' and how does discriminative parental solicitude explain it? (Note that explanation is not justification.)",
        correctAnswer:
          "The Cinderella effect is the elevated risk of abuse/homicide for children living with a stepparent versus two genetic parents; discriminative solicitude predicts lower investment where genetic relatedness (and its motivating love) is absent.",
        explanation:
          "A stepparent lacks the genetic stake that drives parental investment; the evolutionary account predicts where risk concentrates without excusing the behavior.",
        hint: "Think about how relatedness affects the motivation to invest.",
      },
      {
        topicSlug: "male-mate-preferences",
        prompt:
          "What is paternity uncertainty, and name one feature of male sexual psychology it is thought to have shaped.",
        correctAnswer:
          "Paternity uncertainty is the male's inability (ancestrally) to be sure a child is his; it is thought to have shaped male sexual jealousy (and preferences for fidelity cues in long-term mates).",
        explanation:
          "Because females are always certain of maternity but males could not be certain of paternity, this asymmetry shaped male mate-guarding and jealousy.",
      },
    ],
  },

  // ───────────── Week 4 ─────────────
  {
    kind: "homework",
    title: "Homework 4.1 — Kinship, cooperation, aggression",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Short-answer problems on the social world: family, reciprocity, and conflict.",
    problems: [
      {
        topicSlug: "kinship-family-dynamics",
        prompt:
          "Describe the Westermarck effect and what it reveals about how humans recognize kin.",
        correctAnswer:
          "The Westermarck effect is a sexual aversion that develops between people raised in close proximity in early childhood; it shows humans use co-residence as a cue for kinship in incest avoidance, even when those people are unrelated.",
        explanation:
          "Kibbutz studies showed children raised together rarely married, revealing the cue-based machinery (co-residence) behind incest avoidance.",
      },
      {
        topicSlug: "cooperation-reciprocal-altruism",
        prompt:
          "State the conditions under which reciprocal altruism can evolve among non-kin.",
        correctAnswer:
          "Repeated interaction among individuals who can recognize one another and remember past dealings, so that help given now is likely to be reciprocated later.",
        explanation:
          "Trivers showed altruism toward non-relatives can evolve when interactions repeat and partners can track each other's cooperation history.",
        hint: "Think about what is needed to make 'I help you now, you help me later' stable.",
      },
      {
        topicSlug: "cooperation-reciprocal-altruism",
        prompt:
          "Name the winning strategy in Axelrod's prisoner's-dilemma tournaments and describe its rule.",
        correctAnswer:
          "Tit-for-tat: cooperate on the first move, then copy whatever the partner did on the previous move.",
        explanation:
          "Tit-for-tat is nice, retaliatory, forgiving, and clear, and it stabilizes cooperation among self-interested agents in repeated games.",
      },
      {
        topicSlug: "aggression-status-dominance",
        prompt:
          "What is the 'young male syndrome,' and why does it make evolutionary sense?",
        correctAnswer:
          "It is the peak of risk-taking and violence in young men; it makes sense because young men historically faced the fiercest competition for status and mates and had the least to lose.",
        explanation:
          "Homicide and risk-taking show a consistent age-sex signature because the reproductive stakes of status competition were highest for young men.",
      },
    ],
  },
  {
    kind: "homework",
    title: "Homework 4.2 — Coalitions, language, emotions, culture",
    weekNumber: 4,
    isTimed: false,
    timeLimitMinutes: null,
    instructions:
      "Short-answer problems on group psychology, language, emotion, and culture.",
    problems: [
      {
        topicSlug: "coalitions-groups-warfare",
        prompt:
          "What did the Kurzban, Tooby, and Cosmides 'erasing race' study suggest about how the mind categorizes people?",
        correctAnswer:
          "It suggested the mind has no dedicated race module but a coalition-detector that uses race only when race predicts alliance; when team membership was made salient, categorization by race dropped sharply.",
        explanation:
          "Coalitional psychology latches onto whatever currently predicts alliance and releases it when a better predictor (team) is available.",
      },
      {
        topicSlug: "language-communication",
        prompt:
          "State the 'poverty of the stimulus' argument for an innate language faculty.",
        correctAnswer:
          "The language input children hear is too sparse and error-ridden to account for the rich, rule-governed grammar they acquire, implying the child brings innate linguistic structure (universal grammar) to the task.",
        explanation:
          "The gap between impoverished input and rich grammatical output points to built-in structure, not learning from scratch.",
        hint: "Compare what children hear with what they end up able to produce.",
      },
      {
        topicSlug: "emotions-evolved-programs",
        prompt:
          "What does it mean to call an emotion a 'superordinate program,' as Cosmides and Tooby do?",
        correctAnswer:
          "An emotion is a program that coordinates many subsystems at once — attention, perception, physiology, goals, memory, and decision-making — into a mode of operation matched to a recurrent type of situation.",
        explanation:
          "Fear, for example, simultaneously reorganizes the whole organism for threat; emotions are coordinating programs, not noise.",
      },
      {
        topicSlug: "culture-religion-evolved-mind",
        prompt:
          "Distinguish evoked culture from transmitted culture.",
        correctAnswer:
          "Evoked culture is variation produced when a universal evolved psychology meets different local conditions; transmitted culture is ideas and practices passed from mind to mind by social learning.",
        explanation:
          "Both depend on evolved psychology — one as the program responding to local inputs, the other as the learning machinery that copies others.",
      },
    ],
  },
  {
    kind: "final",
    title: "Final Exam — The whole evolved mind",
    weekNumber: 4,
    isTimed: true,
    timeLimitMinutes: 60,
    instructions:
      "Timed. 60 minutes. Cumulative over the entire course. Pasting is disabled. Answer precisely; synthesis questions reward connecting principles across weeks.",
    problems: [
      {
        topicSlug: "capstone-synthesis",
        prompt:
          "Using the craving for sweet and fatty food, illustrate the concept of evolutionary mismatch in one or two sentences.",
        correctAnswer:
          "A taste system selected to reward scarce calories in the ancestral environment now drives overconsumption amid modern abundance, so a once-adaptive mechanism produces a maladaptive outcome (obesity) — a mismatch between the EEA and the current environment.",
        explanation:
          "Mismatch occurs when a mechanism tuned to ancestral conditions misfires in a novel modern environment; the sugar/fat craving is the canonical case.",
      },
      {
        topicSlug: "inclusive-fitness-kin-selection",
        prompt:
          "A behavior costs the actor 2 units of fitness and benefits a full sibling (r = 1/2) by 5 units. Using Hamilton's rule, state whether selection favors it and show the comparison.",
        correctAnswer:
          "rB = (1/2)(5) = 2.5 > C = 2, so rB > C and selection favors the behavior.",
        explanation:
          "Apply $rB > C$: with $r = 1/2$, $B = 5$, $C = 2$, we get $2.5 > 2$, so the altruistic act is favored.",
        hint: "Compute rB and compare it to C.",
      },
      {
        topicSlug: "cooperation-reciprocal-altruism",
        prompt:
          "Contrast the evolutionary basis of helping kin with helping non-kin, naming the mechanism behind each.",
        correctAnswer:
          "Helping kin is explained by kin selection / inclusive fitness (relatives carry copies of one's genes); helping non-kin is explained by reciprocal altruism (repeated, reciprocated exchange among individuals who recognize and remember each other).",
        explanation:
          "Two distinct mechanisms underlie human cooperation: shared genes for kin, and reciprocity (plus reputation and cheater detection) for non-kin.",
      },
      {
        topicSlug: "emotions-evolved-programs",
        prompt:
          "Describe Ekman's cross-cultural research with the Fore and what it demonstrates about basic emotions.",
        correctAnswer:
          "Ekman showed the isolated Fore of Papua New Guinea matched the same facial expressions to emotional stories that Westerners do (and vice versa), demonstrating that basic emotional expressions are universal and evolved rather than culturally learned.",
        explanation:
          "Mutual cross-cultural legibility of emotional faces, in a population with no exposure to Western media, supports an evolved, species-typical emotional repertoire.",
      },
      {
        topicSlug: "levels-of-explanation",
        prompt:
          "A student says, 'Evolutionary psychology claims men's aggression is genetically fixed and therefore acceptable.' Identify the two distinct errors in this sentence.",
        correctAnswer:
          "First, genetic determinism: adaptations are typically conditional (context-sensitive) not fixed. Second, the naturalistic fallacy: explaining why a tendency exists never makes it morally acceptable (is does not imply ought).",
        explanation:
          "The sentence conflates 'evolved' with 'fixed' (determinism) and 'natural' with 'good' (naturalistic fallacy) — two of the most common misunderstandings of the field.",
      },
      {
        topicSlug: "language-communication",
        prompt:
          "What does the phenomenon of creolization (children turning a pidgin into a full grammatical language) demonstrate about language?",
        correctAnswer:
          "It demonstrates that children given impoverished, grammarless input spontaneously generate full grammatical structure, supporting the existence of an innate language faculty that supplies the missing structure.",
        explanation:
          "Creolization (and the emergence of Nicaraguan Sign Language) shows children create grammar, not merely imitate it — strong evidence for the language instinct.",
      },
    ],
  },
];

const EXPECTED_TOPIC_SLUGS = TOPICS.map((t) => t.slug).sort().join(",");

// Bump this whenever lecture bodies, assignment problems, or correct answers
// change in a way that should propagate to the database on the next boot.
// The value is stored alongside topics and compared in seedIfEmpty.
const CONTENT_REVISION = "2026-05-29.evo-psych.r1";

// A sentinel phrase present in exactly one lecture body — used to detect that
// the database holds the *current* revision of the content (not just a set of
// matching slugs). Bump whenever the seed content is overhauled.
const REVISION_SENTINEL_SLUG = "evopsych-what-why";
const REVISION_SENTINEL_PHRASE = "the mind is a set of information-processing devices";

export async function seedIfEmpty(): Promise<void> {
  const existing = await db.execute(sql`select count(*)::int as n from topics`);
  const row = (existing.rows[0] ?? {}) as { n?: number };
  const count = row.n ?? 0;

  if (count > 0) {
    const rows = await db.execute(sql`select slug from topics order by slug`);
    const actualSlugs = (rows.rows as Array<{ slug: string }>)
      .map((r) => r.slug)
      .sort()
      .join(",");
    const slugsMatch = actualSlugs === EXPECTED_TOPIC_SLUGS;
    let revisionMatches = false;
    try {
      const sentinelLec = await db.execute(
        sql`select l.body from lectures l join topics t on l.topic_id = t.id where t.slug = ${REVISION_SENTINEL_SLUG} limit 1`,
      );
      const body = ((sentinelLec.rows[0] ?? {}) as { body?: string }).body ?? "";
      revisionMatches = body.includes(REVISION_SENTINEL_PHRASE);
    } catch {
      revisionMatches = false;
    }
    if (slugsMatch && revisionMatches) {
      logger.info(
        { revision: CONTENT_REVISION },
        "Seed: already populated with current content, skipping",
      );
      return;
    }
    logger.info(
      { revision: CONTENT_REVISION, slugsMatch, revisionMatches },
      "Seed: course content drifted from expected revision — wiping and re-seeding",
    );
    // Order matters: child tables first.
    await db.execute(sql`delete from practice_attempts`);
    await db.execute(sql`delete from practice_problems`);
    await db.execute(sql`delete from practice_sessions`);
    await db.execute(sql`delete from answers`);
    await db.execute(sql`delete from attempts`);
    await db.execute(sql`delete from problems`);
    await db.execute(sql`delete from assignments`);
    await db.execute(sql`delete from lectures`);
    await db.execute(sql`delete from topics`);
  }

  logger.info("Seed: populating course content");

  // Topics + lectures
  const slugToTopicId = new Map<string, number>();
  for (let i = 0; i < TOPICS.length; i++) {
    const t = TOPICS[i]!;
    const [inserted] = await db
      .insert(topicsTable)
      .values({
        slug: t.slug,
        title: t.title,
        weekNumber: t.weekNumber,
        blurb: t.blurb,
        position: i,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert topic ${t.slug}`);
    slugToTopicId.set(t.slug, inserted.id);
    await db.insert(lecturesTable).values({
      topicId: inserted.id,
      weekNumber: t.weekNumber,
      title: t.lectureTitle,
      body: t.body,
    });
  }

  // Assignments + problems
  for (let i = 0; i < ASSIGNMENTS.length; i++) {
    const a = ASSIGNMENTS[i]!;
    const [inserted] = await db
      .insert(assignmentsTable)
      .values({
        kind: a.kind,
        title: a.title,
        weekNumber: a.weekNumber,
        position: i,
        isTimed: a.isTimed,
        timeLimitMinutes: a.timeLimitMinutes,
        instructions: a.instructions,
      })
      .returning();
    if (!inserted) throw new Error(`Failed to insert assignment ${a.title}`);
    for (let p = 0; p < a.problems.length; p++) {
      const prob = a.problems[p]!;
      const topicId = slugToTopicId.get(prob.topicSlug);
      if (!topicId) throw new Error(`Unknown topic slug ${prob.topicSlug}`);
      await db.insert(problemsTable).values({
        assignmentId: inserted.id,
        topicId,
        position: p,
        prompt: prob.prompt,
        correctAnswer: prob.correctAnswer,
        explanation: prob.explanation,
        hint: prob.hint ?? null,
      });
    }
  }

  logger.info({ topics: TOPICS.length, assignments: ASSIGNMENTS.length }, "Seed complete");
}

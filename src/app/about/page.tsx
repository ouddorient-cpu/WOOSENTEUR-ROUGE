
import { Metadata } from 'next';
import { BrainCircuit, Lightbulb, Zap, Rocket, GraduationCap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'À Propos de Woosenteur v2',
  description: "L'histoire derrière Woosenteur v2 : comment un besoin de développeur a donné naissance à un agent IA pour l'e-commerce.",
};

const TimelineItem = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => {
    return (
        <div className="relative flex items-start group">
             <div className="absolute w-0.5 h-full bg-border top-0 left-6 -translate-x-1/2"></div>
            {/* Icon */}
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-md shrink-0 z-10">
                {icon}
            </div>

            {/* Content Card */}
            <div className="w-[calc(100%-4rem)] ml-6">
                <div className={`p-6 rounded-lg shadow-lg bg-card text-card-foreground border transition-transform duration-300 group-hover:scale-[1.02]`}>
                    <h3 className="text-xl font-bold font-headline mb-2">{title}</h3>
                    <div className="text-muted-foreground">{children}</div>
                </div>
            </div>
        </div>
    );
};


const AboutPage = () => {
  return (
    <>
      <div className="text-center mb-16">
        <h1 className="text-5xl font-bold font-headline text-gradient">
            Bonjour, je m'appelle Abderrahmane !
        </h1>
        <p className="lead mt-4 max-w-2xl mx-auto">Fondateur de Woosenteur v2 et passionné par les technologies qui simplifient la vie.</p>
      </div>
      
      <div className="space-y-12 max-w-3xl mx-auto">
        <TimelineItem icon={<GraduationCap />} title="La passion pour le web et l'e-commerce">
            <p>
                Passionné par le web, j'ai suivi en 2023 une formation en création de sites e-commerce. Mon objectif a toujours été simple : comprendre comment fonctionnent les sites web pour les construire proprement. C'est là que j'ai découvert le défi quotidien de nombreux e-commerçants.
            </p>
        </TimelineItem>

        <TimelineItem icon={<BrainCircuit />} title="Le défi : la création de contenu">
             <p>
                En collaborant sur divers projets, j'ai été confronté, comme beaucoup, à la tâche fastidieuse de créer des fiches produits. Rédiger des descriptions engageantes, optimiser pour le SEO, trouver l'inspiration... j'y passais des heures.
            </p>
        </TimelineItem>

        <TimelineItem icon={<Lightbulb />} title="Le déclic : l'arrivée de l'IA">
            <p>
                En 2024, j'ai suivi avec un immense intérêt l'arrivée des intelligences artificielles comme ChatGPT et Gemini. En autodidacte, j'ai pris le train en marche pour intégrer ces outils à mon travail. C'est là que le déclic s'est produit.
            </p>
            <blockquote className="border-l-4 border-primary pl-4 italic my-4 text-left">
                "Pourquoi ne pas créer un agent intelligent pour automatiser cette tâche répétitive et chronophage ?"
            </blockquote>
        </TimelineItem>
        
        <TimelineItem icon={<Zap />} title="La naissance de Woosenteur v2">
             <p>
                Fort de ces nouvelles compétences, j'ai développé Woosenteur v2 : un outil capable de comprendre n'importe quel produit, de rechercher des informations pertinentes et de rédiger une fiche complète, unique et parfaitement optimisée pour le SEO.
            </p>
        </TimelineItem>

        <TimelineItem icon={<Rocket />} title="Les résultats aujourd'hui">
            <p>
                Aujourd'hui, Woosenteur v2 est l'agent intelligent que j'avais imaginé. Il rédige des fiches produits en moins de 3 minutes avec tous les champs SEO attendus par Rank Math — titre, méta, slug, balises alt, JSON-LD. Ma plus grande satisfaction est de m'être libéré de cette corvée pour me consacrer à des aspects plus créatifs de mon métier.
            </p>
        </TimelineItem>
      </div>
    </>
  );
};

export default AboutPage;

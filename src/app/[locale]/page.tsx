import Hero from "@/components/landing/Hero";
import PainPoints from "@/components/landing/PainPoints";
import Features from "@/components/landing/Features";
import Partners from "@/components/landing/Partners";
import HowItWorks from "@/components/landing/HowItWorks";
import Comparison from "@/components/landing/Comparison";
import Pricing from "@/components/landing/Pricing";
import Testimonials from "@/components/landing/Testimonials";
import Roadmap from "@/components/landing/Roadmap";
import CTA from "@/components/landing/CTA";

export default function HomePage() {
    return (
        <>
            <Hero />
            <PainPoints />
            <Features />
            <Partners />
            <HowItWorks />
            <Comparison />
            <Pricing />
            <Testimonials />
            <Roadmap />
            <CTA />
        </>
    );
}

'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Clock, BarChart3, Users, CheckCircle, Calendar, PieChart, FileText, Star } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
// Remove LanguageSwitcher import
import PageTransition from '@/components/PageTransition';
import ScrollAnimation from '@/components/ScrollAnimation';

// Define and export the expected structure for the dictionary passed to this component
// NOTE: This needs to be kept in sync with the actual dictionary files (en.json, pl.json)
export interface LandingPageContentDictionary { // Added export keyword
  title: string;
  description: string;
  signIn: string;
  getStarted: string;
  nav: {
    features: string;
    pricing: string;
    faq: string;
  };
  hero: {
    tagline: string;
    title1: string;
    title2: string;
    buttonFree: string;
    buttonLearn: string;
    imageAlt: string;
  };
  features: {
    title: string;
    description: string;
    card1: { title: string; description: string; item1: string; item2: string; item3: string; };
    card2: { title: string; description: string; item1: string; item2: string; item3: string; };
    card3: { title: string; description: string; item1: string; item2: string; item3: string; };
    card4: { title: string; description: string; item1: string; item2: string; item3: string; };
    card5: { title: string; description: string; item1: string; item2: string; item3: string; };
    card6: { title: string; description: string; item1: string; item2: string; item3: string; };
  };
  pricing: {
    title: string;
    description: string;
    free: { title: string; price: string; description: string; item1: string; item2: string; item3: string; item4: string; button: string; };
    pro: { badge: string; title: string; price: string; description: string; item1: string; item2: string; item3: string; item4: string; item5: string; button: string; };
    enterprise: { title: string; price: string; description: string; item1: string; item2: string; item3: string; item4: string; item5: string; button: string; };
  };
  faq: {
    title: string;
    description: string;
    item1: { question: string; answer: string; };
    item2: { question: string; answer: string; };
    item3: { question: string; answer: string; };
    item4: { question: string; answer: string; };
    item5: { question: string; answer: string; };
  };
  footer: {
    description: string; // Consider if this should be different from the main description
    product: { title: string; features: string; pricing: string; faq: string; };
    company: { title: string; about: string; blog: string; contact: string; };
    support: { title: string; docs: string; help: string; status: string; };
    copyright: string;
    privacy: string;
    terms: string;
  };
}

// Define the props type for LandingPageContent using the specific dictionary type
interface LandingPageContentProps {
  dictionary: LandingPageContentDictionary;
  // Remove lang: string;
}

export default function LandingPageContent({ dictionary }: LandingPageContentProps) { // Remove lang from props
  // Now using the strongly-typed dictionary object

  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        {/* Navigation */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              {/* Assuming title is in the root of the passed dictionary */}
              <span className="text-xl font-bold">{dictionary.title}</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors hover:scale-105">
                {dictionary.nav.features}
              </Link>
              <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors hover:scale-105">
                {dictionary.nav.pricing}
              </Link>
              <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors hover:scale-105">
                {dictionary.nav.faq}
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              {/* Remove LanguageSwitcher usage */}
              <ThemeSwitcher />
              {/* Update links to remove lang */}
              <Link href={`/sign-in`}>
                <Button variant="ghost" className="hidden sm:inline-flex hover:scale-105 transition-transform duration-300">{dictionary.signIn}</Button>
              </Link>
              <Link href={`/sign-up`}>
                <Button className="animate-pulse hover:animate-none hover:scale-105 transition-transform duration-300">{dictionary.getStarted}</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <ScrollAnimation>
          <section className="container mx-auto max-w-7xl py-24 space-y-8 md:py-32">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                {dictionary.hero.tagline}
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                {dictionary.hero.title1} <br />
                <span className="text-primary">{dictionary.hero.title2}</span>
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {/* Use the top-level description passed in */}
                {dictionary.description}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href={`/sign-up`}>
                  <Button size="lg" className="gap-1.5 hover:scale-105 transition-transform duration-300">
                    {dictionary.hero.buttonFree}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="hover:scale-105 transition-transform duration-300">
                    {dictionary.hero.buttonLearn}
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto max-w-5xl rounded-lg overflow-hidden shadow-xl">
              <Image
                src="https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg" // Consider making image src/alt localizable if needed
                alt={dictionary.hero.imageAlt}
                width={1200}
                height={600}
                className="w-full object-cover rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                priority
              />
            </div>
          </section>
        </ScrollAnimation>

        {/* Features Section */}
        <ScrollAnimation delay={0.2}>
          <section id="features" className="container mx-auto max-w-7xl py-24 space-y-16 animate-in fade-in duration-1000">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{dictionary.features.title}</h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {dictionary.features.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature Card 1 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 feature-card-glow">
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>{dictionary.features.card1.title}</CardTitle>
                  <CardDescription>
                    {dictionary.features.card1.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card1.item1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card1.item2}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card1.item3}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature Card 2 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 feature-card-glow">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>{dictionary.features.card2.title}</CardTitle>
                  <CardDescription>
                    {dictionary.features.card2.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card2.item1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card2.item2}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card2.item3}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature Card 3 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 feature-card-glow">
                <CardHeader>
                  <Calendar className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>{dictionary.features.card3.title}</CardTitle>
                  <CardDescription>
                    {dictionary.features.card3.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card3.item1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card3.item2}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card3.item3}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Second row of feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature Card 4 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 feature-card-glow">
                <CardHeader>
                  <PieChart className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>{dictionary.features.card4.title}</CardTitle>
                  <CardDescription>
                    {dictionary.features.card4.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card4.item1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card4.item2}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card4.item3}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature Card 5 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 feature-card-glow">
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>{dictionary.features.card5.title}</CardTitle>
                  <CardDescription>
                    {dictionary.features.card5.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card5.item1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card5.item2}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card5.item3}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature Card 6 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 feature-card-glow">
                <CardHeader>
                  <Star className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>{dictionary.features.card6.title}</CardTitle>
                  <CardDescription>
                    {dictionary.features.card6.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card6.item1}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card6.item2}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">{dictionary.features.card6.item3}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        </ScrollAnimation>

        {/* Pricing Section */}
        <ScrollAnimation delay={0.4}>
          <section id="pricing" className="container mx-auto max-w-7xl py-24 space-y-12 bg-muted/30 rounded-xl">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{dictionary.pricing.title}</h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {dictionary.pricing.description}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className="relative overflow-hidden border-border/40 group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle>{dictionary.pricing.free.title}</CardTitle>
                  <div className="text-3xl font-bold">{dictionary.pricing.free.price}</div>
                  <CardDescription>{dictionary.pricing.free.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.free.item1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.free.item2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.free.item3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.free.item4}</span>
                    </li>
                  </ul>
                  <Link href={`/sign-up`}>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">{dictionary.pricing.free.button}</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="relative overflow-hidden border-primary group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">{dictionary.pricing.pro.badge}</div>
                <CardHeader>
                  <CardTitle>{dictionary.pricing.pro.title}</CardTitle>
                  <div className="text-3xl font-bold">{dictionary.pricing.pro.price}</div>
                  <CardDescription>{dictionary.pricing.pro.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.pro.item1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.pro.item2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.pro.item3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.pro.item4}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.pro.item5}</span>
                    </li>
                  </ul>
                  <Link href={`/sign-up?plan=pro`}>
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">{dictionary.pricing.pro.button}</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="relative overflow-hidden border-border/40 group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle>{dictionary.pricing.enterprise.title}</CardTitle>
                  <div className="text-3xl font-bold">{dictionary.pricing.enterprise.price}</div>
                  <CardDescription>{dictionary.pricing.enterprise.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.enterprise.item1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.enterprise.item2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.enterprise.item3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.enterprise.item4}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">{dictionary.pricing.enterprise.item5}</span>
                    </li>
                  </ul>
                  <Link href={`/contact`}>
                    <Button variant="outline" className="w-full group-hover:bg-muted transition-colors">{dictionary.pricing.enterprise.button}</Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </section>
        </ScrollAnimation>

        {/* FAQ Section */}
        <ScrollAnimation delay={0.3}>
          <section id="faq" className="container mx-auto max-w-7xl py-24 space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">{dictionary.faq.title}</h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                {dictionary.faq.description}
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">{dictionary.faq.item1.question}</AccordionTrigger>
                <AccordionContent>
                  {dictionary.faq.item1.answer}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">{dictionary.faq.item2.question}</AccordionTrigger>
                <AccordionContent>
                  {dictionary.faq.item2.answer}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">{dictionary.faq.item3.question}</AccordionTrigger>
                <AccordionContent>
                  {dictionary.faq.item3.answer}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">{dictionary.faq.item4.question}</AccordionTrigger>
                <AccordionContent>
                  {dictionary.faq.item4.answer}
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">{dictionary.faq.item5.question}</AccordionTrigger>
                <AccordionContent>
                  {dictionary.faq.item5.answer}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </ScrollAnimation>

        {/* Footer */}
        <footer className="border-t py-12 bg-muted/50">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-6 w-6 text-primary" />
                  <span className="text-xl font-bold">{dictionary.title}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {dictionary.footer.description}
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-4">{dictionary.footer.product.title}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {dictionary.footer.product.features}
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {dictionary.footer.product.pricing}
                    </Link>
                  </li>
                  <li>
                    <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {dictionary.footer.product.faq}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">{dictionary.footer.company.title}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href={`/about`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {dictionary.footer.company.about}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/blog`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {dictionary.footer.company.blog}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/contact`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {dictionary.footer.company.contact}
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">{dictionary.footer.support.title}</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href={`/docs`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {dictionary.footer.support.docs}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/help`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {dictionary.footer.support.help}
                    </Link>
                  </li>
                  <li>
                    <Link href={`/status`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {dictionary.footer.support.status}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} {dictionary.title}. {dictionary.footer.copyright}
              </p>
              <div className="flex items-center gap-4">
                <Link href={`/privacy`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {dictionary.footer.privacy}
                </Link>
                <Link href={`/terms`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {dictionary.footer.terms}
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}

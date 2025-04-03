'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Clock, BarChart3, Users, CheckCircle, Calendar, PieChart, FileText, Star } from 'lucide-react';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import PageTransition from '@/components/PageTransition';
import ScrollAnimation from '@/components/ScrollAnimation';

export default function LandingPageContent() {
  return (
    <PageTransition>
      <div className="flex flex-col min-h-screen">
        {/* Navigation */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <Clock className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Trello Time Report</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors hover:scale-105">
                Funkcje
              </Link>
              <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors hover:scale-105">
                Cennik
              </Link>
              <Link href="#faq" className="text-sm font-medium hover:text-primary transition-colors hover:scale-105">
                FAQ
              </Link>
            </nav>
            <div className="flex items-center gap-4">
              <ThemeSwitcher />
              <Link href="/sign-in">
                <Button variant="ghost" className="hidden sm:inline-flex hover:scale-105 transition-transform duration-300">Zaloguj się</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="animate-pulse hover:animate-none hover:scale-105 transition-transform duration-300">Rozpocznij</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <ScrollAnimation>
          <section className="container mx-auto max-w-7xl py-24 space-y-8 md:py-32">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
                Zwiększ produktywność swojego zespołu
              </div>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                Śledź czas zadań w Trello <br />
                <span className="text-primary">Bez wysiłku</span>
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Idealne rozszerzenie dla zespołów, które potrzebują monitorować czas spędzony na zadaniach i generować szczegółowe raporty bezpośrednio z Trello.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="gap-1.5 hover:scale-105 transition-transform duration-300">
                    Zacznij za darmo
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline" className="hover:scale-105 transition-transform duration-300">
                    Dowiedz się więcej
                  </Button>
                </Link>
              </div>
            </div>
            <div className="mx-auto max-w-5xl rounded-lg overflow-hidden shadow-xl">
              <Image
                src="https://images.pexels.com/photos/6476260/pexels-photo-6476260.jpeg"
                alt="Zespół pracujący z Trello Time Report"
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Potężne funkcje</h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Wszystko, czego potrzebujesz do śledzenia czasu i generowania raportów dla swoich tablic Trello.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature Card 1 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>Szczegółowe Raporty</CardTitle>
                  <CardDescription>
                    Generuj kompleksowe raporty według tablicy, listy, członka zespołu lub okresu czasu. Eksportuj dane w wielu formatach.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Niestandardowe zakresy dat</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Eksport do CSV/PDF</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Filtrowanie według członka zespołu</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature Card 2 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>Analityka Zespołowa</CardTitle>
                  <CardDescription>
                    Wizualizuj produktywność swojego zespołu i identyfikuj wąskie gardła dzięki interaktywnym dashboardom.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Trendy produktywności</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Rozkład obciążenia pracą</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Wgląd w alokację czasu</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature Card 3 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Calendar className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>Śledzenie Czasu</CardTitle>
                  <CardDescription>
                    Łatwe rejestrowanie czasu spędzonego na zadaniach bezpośrednio z kart Trello. Automatyczne sumowanie i analiza.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Intuicyjny interfejs</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Śledzenie w czasie rzeczywistym</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Komentarze do wpisów czasowych</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Second row of feature cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Feature Card 4 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <PieChart className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>Wizualizacja Danych</CardTitle>
                  <CardDescription>
                    Przekształć dane czasowe w przejrzyste wykresy i diagramy, które pomagają w podejmowaniu decyzji.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Wykresy kołowe i słupkowe</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Wykresy trendów czasowych</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Eksport wizualizacji</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature Card 5 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <FileText className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>Rozliczanie Projektów</CardTitle>
                  <CardDescription>
                    Automatycznie generuj raporty rozliczeniowe na podstawie zarejestrowanego czasu pracy.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Raporty fakturowania</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Stawki godzinowe</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Eksport do systemów księgowych</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Feature Card 6 */}
              <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <Star className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <CardTitle>Integracja z Trello</CardTitle>
                  <CardDescription>
                    Bezproblemowa integracja z Trello bez zakłócania istniejącego przepływu pracy.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Natywna integracja</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Synchronizacja w czasie rzeczywistym</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span className="text-sm">Brak dodatkowych konfiguracji</span>
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Przejrzyste ceny</h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Wybierz plan, który najlepiej odpowiada potrzebom Twojego zespołu.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free Plan */}
              <Card className="relative overflow-hidden border-border/40 group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle>Darmowy</CardTitle>
                  <div className="text-3xl font-bold">0 zł</div>
                  <CardDescription>Idealny do rozpoczęcia pracy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Do 3 tablic Trello</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Podstawowe raporty</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Eksport do CSV</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">1 użytkownik</span>
                    </li>
                  </ul>
                  <Link href="/sign-up">
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">Rozpocznij za darmo</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Pro Plan */}
              <Card className="relative overflow-hidden border-primary group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-medium">Popularny</div>
                <CardHeader>
                  <CardTitle>Pro</CardTitle>
                  <div className="text-3xl font-bold">49 zł</div>
                  <CardDescription>miesięcznie za użytkownika</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Nieograniczona liczba tablic</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Zaawansowane raporty i wykresy</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Eksport do CSV, PDF, Excel</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Analityka zespołowa</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Priorytetowe wsparcie</span>
                    </li>
                  </ul>
                  <Link href="/sign-up?plan=pro">
                    <Button className="w-full group-hover:bg-primary/90 transition-colors">Wybierz plan Pro</Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card className="relative overflow-hidden border-border/40 group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <CardTitle>Enterprise</CardTitle>
                  <div className="text-3xl font-bold">Kontakt</div>
                  <CardDescription>Rozwiązanie dla dużych zespołów</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Wszystko z planu Pro</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Dedykowane wsparcie</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Niestandardowe integracje</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">Zaawansowane zabezpieczenia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-primary mt-1" />
                      <span className="text-sm">SLA i wsparcie 24/7</span>
                    </li>
                  </ul>
                  <Link href="/contact">
                    <Button variant="outline" className="w-full group-hover:bg-muted transition-colors">Skontaktuj się z nami</Button>
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
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Często zadawane pytania</h2>
              <p className="max-w-[700px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Odpowiedzi na najczęściej zadawane pytania dotyczące Trello Time Report.
              </p>
            </div>

            <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
              <AccordionItem value="item-1">
                <AccordionTrigger className="text-left">Jak zacząć korzystać z Trello Time Report?</AccordionTrigger>
                <AccordionContent>
                  Aby rozpocząć, zarejestruj się za darmo, połącz swoje konto Trello i wybierz tablice, które chcesz monitorować. Nasz intuicyjny interfejs przeprowadzi Cię przez proces konfiguracji w kilka minut.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger className="text-left">Czy mogę eksportować dane do innych formatów?</AccordionTrigger>
                <AccordionContent>
                  Tak, Trello Time Report umożliwia eksport danych do formatów CSV, PDF i Excel. Możesz również zintegrować nasze API z innymi narzędziami do analizy danych.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger className="text-left">Czy aplikacja działa na urządzeniach mobilnych?</AccordionTrigger>
                <AccordionContent>
                  Tak, nasza aplikacja jest w pełni responsywna i działa na wszystkich urządzeniach mobilnych. Możesz śledzić czas i przeglądać raporty z dowolnego miejsca.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger className="text-left">Czy mogę śledzić czas dla wielu tablic Trello?</AccordionTrigger>
                <AccordionContent>
                  Oczywiście! Możesz śledzić czas dla nieograniczonej liczby tablic Trello. Nasze narzędzie pozwala na łatwe przełączanie się między tablicami i generowanie raportów zbiorczych.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-5">
                <AccordionTrigger className="text-left">Jak działa rozliczanie i jakie są plany cenowe?</AccordionTrigger>
                <AccordionContent>
                  Oferujemy darmowy plan startowy oraz plany premium z dodatkowymi funkcjami. Rozliczanie odbywa się miesięcznie lub rocznie, z rabatem przy płatności rocznej. Szczegółowe informacje znajdziesz w sekcji Cennik.
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
                  <span className="text-xl font-bold">Trello Time Report</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Monitoruj czas spędzony na zadaniach w Trello i generuj szczegółowe raporty.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-4">Produkt</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Funkcje
                    </Link>
                  </li>
                  <li>
                    <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Cennik
                    </Link>
                  </li>
                  <li>
                    <Link href="#faq" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">Firma</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      O nas
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Kontakt
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium mb-4">Wsparcie</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Dokumentacja
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Centrum pomocy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      Status
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                © {new Date().getFullYear()} Trello Time Report. All rights reserved.
              </p>
              <div className="flex items-center gap-4">
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center border-b">
        <Link className="flex items-center justify-center" href="/">
          <span className="font-bold text-xl">AMANAT</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/catalog">
            Каталог
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/calculator">
            Калькулятор
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/usloviya">
            Условия
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
            Войти
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary text-primary-foreground">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Рассрочка по Исламским Принципам
                </h1>
                <p className="mx-auto max-w-[700px] text-primary-foreground/90 md:text-xl">
                  Честная рассрочка без скрытых комиссий и штрафов. Прозрачные условия для всех.
                </p>
              </div>
              <div className="space-x-4">
                <Button variant="secondary" asChild>
                  <Link href="/catalog">Выбрать товар</Link>
                </Button>
                <Button variant="outline" className="bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                  <Link href="/calculator">Рассчитать</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">© 2024 Amanat. Все права защищены.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms
          </Link>
        </nav>
      </footer>
    </div>
  );
}

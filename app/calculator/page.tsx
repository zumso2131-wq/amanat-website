import { CalculatorForm } from "@/components/calculator-form";

export default function CalculatorPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Калькулятор Рассрочки</h1>
      <CalculatorForm />
    </div>
  );
}

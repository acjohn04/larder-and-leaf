"use client";

import { useState } from 'react';
import { generateMealIdeas, consumeMeal } from '@/app/actions/inventory';
import { useDictionary } from '@/components/DictionaryProvider';

interface IngredientUsage {
    name: string;
    quantityPerPerson: number;
    unit: string;
}

interface MealIdea {
    name: string;
    description: string;
    ingredients: IngredientUsage[];
}

export default function GeneratorPage() {
    const [ideas, setIdeas] = useState<MealIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConsuming, setIsConsuming] = useState(false);
    const [selectedMeal, setSelectedMeal] = useState<number | null>(null);
    const [peopleCount, setPeopleCount] = useState(2);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const dict = useDictionary();

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setSuccess(false);
        setSelectedMeal(null);
        try {
            const result = await generateMealIdeas();
            if (!Array.isArray(result) && result.error) {
                setError(result.error);
            } else {
                setIdeas(result);
            }
        } catch (err: unknown) {
            console.error("Error generating ideas:", err);
            setError(err instanceof Error ? err.message : dict.errors.generateFailed);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConsume = async (index: number) => {
        const meal = ideas[index];
        setIsConsuming(true);
        setError(null);
        try {
            const ingredientsToConsume = meal.ingredients.map(ing => ({
                name: ing.name,
                quantity: ing.quantityPerPerson * peopleCount
            }));
            await consumeMeal(ingredientsToConsume);
            setSuccess(true);
            setIdeas([]);
            setSelectedMeal(null);
        } catch (err: unknown) {
            console.error("Error consuming meal:", err);
            setError(dict.errors.consumeFailed);
        } finally {
            setIsConsuming(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-on-surface tracking-tight mb-2 font-display">{dict.generator.title}</h1>
                    <p className="text-on-surface-variant text-lg max-w-lg">{dict.generator.subtitle}</p>
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="bg-primary text-surface-container-lowest px-8 py-4 rounded-full font-bold shadow-ambient-md shadow-primary/20 hover:shadow-primary/30 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <span className={`material-symbols-outlined ${isLoading ? 'animate-spin' : ''}`} data-icon={isLoading ? "sync" : "auto_awesome"}>
                        {isLoading ? "sync" : "auto_awesome"}
                    </span>
                    {isLoading ? dict.generator.loading : dict.generator.generate}
                </button>
            </header>

            {error && (
                <div className="mb-8 p-4 bg-error/10 border border-error/20 text-error rounded-2xl flex items-center gap-3">
                    <span className="material-symbols-outlined">error</span>
                    <p className="font-medium">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-8 p-4 bg-primary/10 border border-primary/20 text-primary rounded-2xl flex items-center gap-3">
                    <span className="material-symbols-outlined">check_circle</span>
                    <p className="font-medium">{dict.intake.savedTitle}</p>
                </div>
            )}

            {ideas.length > 0 ? (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {ideas.map((idea, index) => (
                        <div
                            key={index}
                            className={`bg-surface-container-low rounded-[2rem] p-8 border transition-all flex flex-col h-full ${selectedMeal === index ? 'border-primary shadow-ambient-lg ring-1 ring-primary/20' : 'border-outline-variant/10 shadow-ambient-sm'
                                }`}
                        >
                            <div className="mb-6 flex justify-between items-start">
                                <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <span className="material-symbols-outlined text-3xl">restaurant</span>
                                </div>
                                {selectedMeal === index && (
                                    <span className="bg-primary text-surface-container-lowest text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Selected</span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-on-surface mb-3 leading-tight">{idea.name}</h3>
                            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 flex-grow">{idea.description}</p>

                            <div className="mb-6 pt-6 border-t border-outline-variant/5">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-3">{dict.generator.keyIngredients}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {idea.ingredients.map((ing, i) => (
                                        <div key={i} className="flex flex-col gap-0.5 px-3 py-2 bg-surface-container-high rounded-xl">
                                            <span className="text-on-surface text-[10px] font-bold">{ing.name}</span>
                                            <span className="text-on-surface-variant text-[9px]">{ing.quantityPerPerson} {ing.unit} {dict.generator.perPerson}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {selectedMeal === index ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-surface-container-highest/50 p-4 rounded-2xl">
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-2">
                                            {dict.generator.numPeople}
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <button
                                                onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                                                className="h-8 w-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high active:scale-90 transition-all cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-sm">remove</span>
                                            </button>
                                            <span className="text-lg font-bold w-4 text-center">{peopleCount}</span>
                                            <button
                                                onClick={() => setPeopleCount(peopleCount + 1)}
                                                className="h-8 w-8 rounded-full border border-outline-variant flex items-center justify-center hover:bg-surface-container-high active:scale-90 transition-all cursor-pointer"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedMeal(null)}
                                            className="flex-1 py-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                                        >
                                            {dict.deleteModal.cancel}
                                        </button>
                                        <button
                                            onClick={() => handleConsume(index)}
                                            disabled={isConsuming}
                                            className="flex-[2] bg-primary text-surface-container-lowest py-3 rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-ambient-sm hover:shadow-ambient-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
                                        >
                                            {isConsuming ? (
                                                <>
                                                    <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                                                    {dict.generator.cooking}
                                                </>
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-sm">skillet</span>
                                                    {dict.generator.confirmMeal}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setSelectedMeal(index)}
                                    className="w-full py-4 border border-outline-variant/30 rounded-2xl text-[11px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer"
                                >
                                    {dict.generator.selectMeal}
                                </button>
                            )}
                        </div>
                    ))}
                </section>
            ) : !isLoading && (
                <section className="mb-12 flex flex-col items-center justify-center text-center py-24 bg-surface-container-low rounded-[3rem] border-ghost">
                    <span className="material-symbols-outlined text-outline-variant text-5xl mb-4">restaurant_menu</span>
                    <h2 className="text-2xl font-bold font-display mb-2">{dict.generator.emptyTitle}</h2>
                    <p className="text-on-surface-variant max-w-sm mb-6">{dict.generator.emptyDescription}</p>
                </section>
            )}

            {isLoading && ideas.length === 0 && (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-pulse">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 h-64">
                            <div className="h-12 w-12 bg-surface-container-high rounded-2xl mb-6"></div>
                            <div className="h-6 bg-surface-container-high rounded-full w-3/4 mb-4"></div>
                            <div className="h-4 bg-surface-container-high rounded-full w-full mb-2"></div>
                            <div className="h-4 bg-surface-container-high rounded-full w-5/6"></div>
                        </div>
                    ))}
                </section>
            )}
        </div>
    );
}

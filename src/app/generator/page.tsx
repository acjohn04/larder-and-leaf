"use client";

import { useState } from 'react';
import { generateMealIdeas } from '../actions/inventory';
import { useDictionary } from '@/components/DictionaryProvider';

interface MealIdea {
    name: string;
    description: string;
    mainIngredients: string[];
}

export default function GeneratorPage() {
    const [ideas, setIdeas] = useState<MealIdea[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const dict = useDictionary();

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const result = await generateMealIdeas();
            setIdeas(result);
        } catch (err: any) {
            console.error("Error generating ideas:", err);
            setError(err.message || dict.errors.generateFailed);
        } finally {
            setIsLoading(false);
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

            {ideas.length > 0 ? (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {ideas.map((idea, index) => (
                        <div key={index} className="bg-surface-container-low rounded-[2rem] p-8 border border-outline-variant/10 shadow-ambient-sm hover:shadow-ambient-md transition-all flex flex-col h-full">
                            <div className="mb-6 h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-3xl">restaurant</span>
                            </div>
                            <h3 className="text-xl font-bold text-on-surface mb-3 leading-tight">{idea.name}</h3>
                            <p className="text-on-surface-variant text-sm leading-relaxed mb-6 flex-grow">{idea.description}</p>
                            
                            <div className="pt-6 border-t border-outline-variant/5">
                                <p className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mb-3">{dict.generator.keyIngredients}</p>
                                <div className="flex flex-wrap gap-2">
                                    {idea.mainIngredients.map((ing, i) => (
                                        <span key={i} className="px-3 py-1 bg-surface-container-high text-on-surface text-[10px] font-bold rounded-full">
                                            {ing}
                                        </span>
                                    ))}
                                </div>
                            </div>
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

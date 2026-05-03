"use client";

import { useRef, useState } from 'react';
import { addInventoryItems } from '../actions/inventory';
import { useDictionary } from '@/components/DictionaryProvider';

interface IntakeItem {
  uid: string;
  name: string;
  category: string;
  quantity: { current: number; unit: string };
  expires_in_days: number;
  metadata: {
    is_barcode: boolean;
    confidence: number;
    added_at: string;
    freshness_rating: number;
    status: string;
  };
}

export default function IntakePage() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [scannedItems, setScannedItems] = useState<IntakeItem[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const dict = useDictionary();

    const handleContainerClick = () => {
        if (!isAnalyzing) {
            fileInputRef.current?.click();
        }
    };

    // Triggered by the hidden <input> when the user selects a file.
    // Sends the image to the Vision API as multipart form data.
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setIsAnalyzing(true);
            setError(null);
            setSaveSuccess(false);
            
            const formData = new FormData();
            formData.append("image", file);

            try {
                const response = await fetch("/api/vision", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || dict.errors.analysisFailed);
                }

                const data = await response.json();
                setScannedItems(data.items || []);
            } catch (err: any) {
                console.error("Error analyzing image:", err);
                setError(err.message || dict.errors.analysisFailed);
            } finally {
                setIsAnalyzing(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                }
            }
        }
    };

    // Map the Gemini-returned IntakeItem shape to the server action's
    // expected input. The key transformation is converting
    // `expires_in_days` (relative) to an absolute `expiresAt` Date.
    const handleAddToInventory = async () => {
        if (scannedItems.length === 0) return;
        setIsSaving(true);
        setError(null);
        try {
            const itemsToSave = scannedItems.map(item => {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + item.expires_in_days);
                
                return {
                    name: item.name,
                    category: item.category,
                    quantity: item.quantity.current,
                    unit: item.quantity.unit,
                    confidenceScore: item.metadata.confidence,
                    expiresAt: expiresAt
                };
            });
            await addInventoryItems(itemsToSave);
            setScannedItems([]);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 5000);
            
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err: any) {
            console.error("Error saving items:", err);
            setError(err.message || dict.errors.saveFailed);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <header className="mb-10">
                <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-2 font-display">{dict.intake.title}</h1>
                <p className="text-on-surface-variant text-lg max-w-xl">{dict.intake.subtitle}</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Upload */}
                <div className="lg:col-span-7 space-y-6">
                    <div 
                        onClick={handleContainerClick}
                        className={`group relative bg-surface-container-low rounded-[2rem] border-2 border-dashed ${isAnalyzing ? 'border-primary opacity-50 cursor-not-allowed' : 'border-outline-variant/30 hover:border-primary/40 cursor-pointer'} transition-all p-12 text-center min-h-[400px] flex items-center justify-center`}
                    >
                        <input 
                            type="file" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*"
                            disabled={isAnalyzing}
                        />
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-2 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-4xl" data-icon="cloud_upload">cloud_upload</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-on-surface font-display">
                                    {isAnalyzing ? dict.intake.analyzingHeading : dict.intake.dropHeading}
                                </h3>
                                <p className="text-on-surface-variant mt-1">
                                    {isAnalyzing ? dict.intake.analyzingSubtext : dict.intake.dropSubtext}
                                </p>
                            </div>
                            <button 
                                disabled={isAnalyzing}
                                className="mt-4 px-6 py-2 bg-surface-container-high text-on-surface-variant rounded-full text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-50"
                            >
                                {isAnalyzing ? dict.intake.processing : dict.intake.selectFile}
                            </button>
                        </div>
                    </div>
                    {error && (
                        <div className="p-4 bg-error-container text-on-error-container rounded-2xl text-sm">
                            {error}
                        </div>
                    )}
                </div>

                {/* Right Column: Identified Items */}
                <div className="lg:col-span-5 flex flex-col h-full">
                     {isAnalyzing ? (
                         <div className="bg-surface-container-low rounded-[2rem] p-8 sticky top-24 border border-outline-variant/10 h-fit min-h-[300px] flex flex-col items-center justify-center text-center">
                             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                             <h3 className="font-bold font-display text-lg mb-1">{dict.intake.analyzingPanel}</h3>
                             <p className="text-sm text-on-surface-variant">{dict.intake.analyzingPanelSubtext}</p>
                         </div>
                     ) : scannedItems.length > 0 ? (
                         <div className="bg-surface-container-low rounded-[2rem] p-6 sticky top-24 border border-outline-variant/10 h-fit flex flex-col space-y-4">
                             <div className="flex justify-between items-center mb-2">
                                 <h3 className="font-bold font-display text-xl">{dict.intake.identifiedItems}</h3>
                                 <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{dict.intake.itemsCount.replace('{count}', String(scannedItems.length))}</span>
                             </div>
                             <div className="flex flex-col space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                                 {scannedItems.map((item, index) => (
                                     <div key={index} className="bg-surface p-4 rounded-xl shadow-sm border border-outline-variant/20 flex flex-col">
                                         <div className="flex justify-between items-start mb-2">
                                             <h4 className="font-semibold text-on-surface">{item.name}</h4>
                                             <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-1 rounded-md font-medium">
                                                 {item.quantity.current} {item.quantity.unit}
                                             </span>
                                         </div>
                                         <div className="flex justify-between items-center text-xs text-on-surface-variant">
                                             <span className="capitalize">{item.category} • {item.metadata.status.replace("_", " ")}</span>
                                             <span className="flex items-center text-tertiary">
                                                 <span className="material-symbols-outlined text-[14px] mr-1" data-icon="robot_2">robot_2</span>
                                                 {Math.round(item.metadata.confidence * 100)}% {dict.intake.confidenceSuffix}
                                             </span>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                             <button 
                                onClick={handleAddToInventory}
                                disabled={isSaving}
                                className="w-full mt-4 py-4 bg-primary text-surface-container-lowest rounded-full font-bold shadow-ambient-md shadow-primary/20 hover:shadow-primary/30 cursor-pointer active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                             >
                                 {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-on-primary mr-2"></div>
                                        {dict.intake.saving}
                                    </>
                                 ) : dict.intake.addToInventory}
                             </button>
                         </div>
                     ) : (
                         <div className="bg-surface-container-low rounded-[2rem] p-8 sticky top-24 border border-outline-variant/10 h-fit min-h-[300px] flex flex-col items-center justify-center text-center">
                             {saveSuccess ? (
                                 <>
                                     <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary mb-4">
                                         <span className="material-symbols-outlined text-4xl" data-icon="check_circle">check_circle</span>
                                     </div>
                                     <h3 className="font-bold font-display text-xl mb-1 text-primary">{dict.intake.savedTitle}</h3>
                                     <p className="text-sm text-on-surface-variant">{dict.intake.savedSubtext}</p>
                                 </>
                             ) : (
                                 <>
                                     <span className="material-symbols-outlined text-outline-variant text-4xl mb-3">document_scanner</span>
                                     <h3 className="font-bold font-display text-lg mb-1">{dict.intake.emptyTitle}</h3>
                                     <p className="text-sm text-on-surface-variant">{dict.intake.emptySubtext}</p>
                                 </>
                             )}
                         </div>
                     )}
                </div>
            </div>
        </div>
    );
}

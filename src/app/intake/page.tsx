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
    min_threshold: number;
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
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Partial<IntakeItem>>({});

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
            } catch (err: unknown) {
                console.error("Error analyzing image:", err);
                setError(err instanceof Error ? err.message : dict.errors.analysisFailed);
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
                    expiresAt: expiresAt,
                    minThreshold: item.metadata.min_threshold
                };
            });
            await addInventoryItems(itemsToSave);
            setScannedItems([]);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 5000);
            
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err: unknown) {
            console.error("Error saving items:", err);
            setError(err instanceof Error ? err.message : dict.errors.saveFailed);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEditClick = (index: number, item: IntakeItem) => {
        setEditingIndex(index);
        setEditForm({ ...item, quantity: { ...item.quantity } });
    };

    const handleDeleteClick = (index: number) => {
        const newItems = [...scannedItems];
        newItems.splice(index, 1);
        setScannedItems(newItems);
        if (editingIndex === index) {
            setEditingIndex(null);
        } else if (editingIndex !== null && editingIndex > index) {
            setEditingIndex(editingIndex - 1);
        }
    };

    const handleSaveEdit = () => {
        if (editingIndex !== null) {
            const newItems = [...scannedItems];
            newItems[editingIndex] = {
                ...newItems[editingIndex],
                ...editForm,
            } as IntakeItem;
            setScannedItems(newItems);
            setEditingIndex(null);
        }
    };

    const handleCancelEdit = () => {
        setEditingIndex(null);
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
                                         {editingIndex === index ? (
                                             <div className="flex flex-col space-y-3">
                                                 <input 
                                                     type="text" 
                                                     value={editForm.name || ''} 
                                                     onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                                     className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                                                     placeholder="Item Name"
                                                 />
                                                 <div className="flex space-x-2">
                                                     <input 
                                                         type="number" 
                                                         value={editForm.quantity?.current === undefined ? '' : editForm.quantity.current} 
                                                         onChange={(e) => setEditForm({...editForm, quantity: { current: parseFloat(e.target.value) || 0, unit: editForm.quantity?.unit || '' }})}
                                                         className="w-1/2 bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                                                         placeholder="Quantity"
                                                     />
                                                     <input 
                                                         type="text" 
                                                         value={editForm.quantity?.unit || ''} 
                                                         onChange={(e) => setEditForm({...editForm, quantity: { current: editForm.quantity?.current || 0, unit: e.target.value }})}
                                                         className="w-1/2 bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                                                         placeholder="Unit"
                                                     />
                                                 </div>
                                                 <div className="flex flex-col space-y-1">
                                                     <label className="text-[10px] uppercase tracking-wider font-bold text-on-surface-variant ml-1">Min Threshold</label>
                                                     <input 
                                                         type="number" 
                                                         step="0.1"
                                                         value={editForm.metadata?.min_threshold === undefined ? '' : editForm.metadata.min_threshold} 
                                                         onChange={(e) => setEditForm({
                                                             ...editForm, 
                                                             metadata: { 
                                                                 ...editForm.metadata!, 
                                                                 min_threshold: parseFloat(e.target.value) || 0 
                                                             }
                                                         })}
                                                         className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                                                         placeholder="Min Threshold"
                                                     />
                                                 </div>
                                                 <select
                                                     value={editForm.category || ''}
                                                     onChange={(e) => setEditForm({...editForm, category: e.target.value})}
                                                     className="w-full bg-surface-container border border-outline-variant/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-on-surface"
                                                 >
                                                     <option value="produce">{dict.categories.produce}</option>
                                                     <option value="pantry">{dict.categories.pantry}</option>
                                                     <option value="dairy_eggs">{dict.categories.dairy_eggs}</option>
                                                     <option value="meat_seafood">{dict.categories.meat_seafood}</option>
                                                     <option value="bakery">{dict.categories.bakery}</option>
                                                     <option value="frozen">{dict.categories.frozen}</option>
                                                 </select>
                                                 <div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-outline-variant/10">
                                                     <button onClick={handleCancelEdit} className="px-4 py-2 text-xs font-bold text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors cursor-pointer">{dict.intake.cancelEdit}</button>
                                                     <button onClick={handleSaveEdit} className="px-4 py-2 text-xs font-bold bg-primary text-on-primary hover:bg-primary/90 rounded-full transition-colors shadow-sm cursor-pointer">{dict.intake.saveItem}</button>
                                                 </div>
                                             </div>
                                         ) : (
                                             <>
                                                 <div className="flex justify-between items-start mb-2">
                                                     <div>
                                                         <h4 className="font-semibold text-on-surface">{item.name}</h4>
                                                         <div className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold mt-1">
                                                             {dict.categories[item.category.toLowerCase() as keyof typeof dict.categories] || item.category} • {item.metadata.status.replace("_", " ")}
                                                         </div>
                                                     </div>
                                                     <div className="flex flex-col items-end">
                                                         <span className="text-xs bg-secondary-container text-on-secondary-container px-2 py-1 rounded-md font-medium">
                                                             {item.quantity.current} {item.quantity.unit}
                                                         </span>
                                                         <span className="text-[10px] text-on-surface-variant mt-1">
                                                             Min: {item.metadata.min_threshold} {item.quantity.unit}
                                                         </span>
                                                     </div>
                                                 </div>
                                                 <div className="flex justify-between items-center mt-3 border-t border-outline-variant/10 pt-3">
                                                     <span className="flex items-center text-tertiary text-[10px] font-medium bg-tertiary/10 px-2 py-1 rounded-md">
                                                         <span className="material-symbols-outlined text-[12px] mr-1" data-icon="robot_2">robot_2</span>
                                                         {Math.round(item.metadata.confidence * 100)}% {dict.intake.confidenceSuffix}
                                                     </span>
                                                     <div className="flex space-x-1">
                                                         <button onClick={() => handleEditClick(index, item)} className="group relative p-1.5 text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center cursor-pointer" aria-label={dict.intake.editItem}>
                                                             <span className="material-symbols-outlined text-[18px]">edit</span>
                                                             <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-sm z-10 pointer-events-none">
                                                                 {dict.intake.editItem}
                                                             </span>
                                                         </button>
                                                         <button onClick={() => handleDeleteClick(index)} className="group relative p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded-lg transition-colors flex items-center cursor-pointer" aria-label={dict.intake.deleteItem}>
                                                             <span className="material-symbols-outlined text-[18px]">delete</span>
                                                             <span className="absolute -top-8 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-transform origin-bottom bg-inverse-surface text-inverse-on-surface text-[10px] px-2 py-1 rounded-md whitespace-nowrap shadow-sm z-10 pointer-events-none">
                                                                 {dict.intake.deleteItem}
                                                             </span>
                                                         </button>
                                                     </div>
                                                 </div>
                                             </>
                                         )}
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

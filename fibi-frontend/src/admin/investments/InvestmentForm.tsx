import { useState } from "react";
import ImageUploader from "../components/ImageUploader";

interface Props {
  submitLabel: string;
}

export default function InvestmentForm({ submitLabel }: Props) {
    
    const [images, setImages] = useState<(File | string)[]>([]);

  return (
    <form className="bg-white p-6 rounded-xl shadow space-y-6 max-w-3xl">
      <input className="w-full border p-3 rounded" placeholder="Title" />
      <input className="w-full border p-3 rounded" placeholder="Location" />
      <textarea className="w-full border p-3 rounded h-32" placeholder="Description" />

      <div className="grid grid-cols-2 gap-4">
        <input className="border p-3 rounded" type="number" placeholder="Price per Unit" />
        <input className="border p-3 rounded" placeholder="ROI (e.g. 18%)" />
      </div>

      <ImageUploader
      label="Investment Images"
        value={images}
        onChange={setImages}
        maxImages={5} 
      />

      <button className="bg-emerald-600 text-white px-6 py-3 rounded">
        {submitLabel}
      </button>
    </form>
  );
}

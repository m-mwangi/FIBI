import { useState } from "react";
import AdminLayout from "./AdminLayout";
import ImageUploader from "./components/ImageUploader";


export default function HeroAdmin() {

    const [images, setImages] = useState<(File | string)[]>([]);
    
  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Hero Section</h2>

      <form className="bg-white p-6 rounded-xl shadow space-y-6 max-w-2xl">
        <input className="w-full border p-3 rounded" placeholder="Hero Title" />
        <textarea className="w-full border p-3 rounded h-24" placeholder="Hero Subtitle" />
        <ImageUploader 
            label="Investment Images"
            value={images}
            onChange={setImages}
            maxImages={6} 
        />

        <button className="bg-emerald-600 text-white px-6 py-3 rounded">
          Update Hero
        </button>
      </form>
    </AdminLayout>
  );
}

import type { ChangeEvent } from "react";

interface ImageUploaderProps {
  value: (File | string)[];
  onChange: (images: (File | string)[]) => void;
  label?: string;
  maxImages?: number;
  accept?: string;
}

export default function ImageUploader({
  value,
  onChange,
  label = "Images",
  maxImages = 5,
  accept = "image/*",
}: ImageUploaderProps) {
  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const newImages = [...value, ...files].slice(0, maxImages);

    onChange(newImages);
  }

  function removeImage(index: number) {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  }

  return (
    <div>
      <label className="block font-semibold mb-2">{label}</label>

      <input
        type="file"
        accept={accept}
        multiple
        onChange={handleFiles}
        className="w-full border p-3 rounded"
      />

      <p className="text-sm text-gray-500 mt-1">
        Max {maxImages} images
      </p>

      {/* Preview */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          {value.map((img, i) => (
            <div key={i} className="relative">
              <img
                src={typeof img === "string" ? img : URL.createObjectURL(img)}
                className="h-24 w-full object-cover rounded"
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

# Image Upload System - Usage Guide

## How It Works

### 1. ImageUploader Component

The `ImageUploader` component provides a complete image upload workflow:

```tsx
import ImageUploader from '@/components/ImageUploader'

// In your form component:
const [imageUrl, setImageUrl] = useState('')

<ImageUploader 
  onUpload={(url) => setImageUrl(url)} 
  initialUrl={imageUrl || null} 
/>
```

**Features:**
- File picker (accepts all image formats)
- Interactive crop area with zoom
- 16:9 aspect ratio (perfect for article previews)
- Uploads to Supabase storage bucket `images`
- Returns public URL via callback

### 2. Upload Flow

```
User selects image → Preview with crop tool → User adjusts crop/zoom → Click "Upload Image" → 
Image cropped to canvas → Converted to JPEG blob → Uploaded to Supabase → 
Public URL returned → onUpload callback fired
```

### 3. Integration Example (New Article Form)

```tsx
// State
const [formData, setFormData] = useState({
  imageUrl: '',
  // ... other fields
})

// Upload handler
const handleImageUpload = (url: string) => {
  setFormData(prev => ({ ...prev, imageUrl: url }))
}

// In JSX
<ImageUploader 
  onUpload={handleImageUpload} 
  initialUrl={formData.imageUrl || null} 
/>

{formData.imageUrl && (
  <img src={formData.imageUrl} alt="preview" className="w-full max-h-48 object-cover" />
)}
```

### 4. Supabase Storage Structure

```
images/
  ├── 1729512345678-upload.jpg  (timestamp-based filename)
  ├── 1729512456789-upload.jpg
  └── ...
```

**Public URL format:**
```
https://[project-ref].supabase.co/storage/v1/object/public/images/[filename]
```

### 5. Error Handling

The component handles:
- Missing cropped area (won't upload)
- Blob creation failures
- Supabase upload errors
- Shows user-friendly alerts

### 6. Technical Details

**Dependencies:**
- `react-easy-crop` - Interactive crop UI
- `@supabase/supabase-js` - Storage upload

**Image Processing:**
- Aspect ratio: 16:9 (configurable in component)
- Output format: JPEG
- Quality: 90%
- Creates canvas, draws cropped region, converts to blob

**Supabase Configuration:**
- Bucket: `images` (must be created and set to public)
- Cache control: 3600s (1 hour)
- Upsert: false (prevents overwriting)

## Testing Checklist

- [ ] Supabase `images` bucket created and set to public
- [ ] Select an image file
- [ ] Crop area appears with zoom slider
- [ ] Adjust crop position and zoom
- [ ] Click "Upload Image"
- [ ] Image uploads successfully
- [ ] Public URL returned
- [ ] Preview shows uploaded image
- [ ] URL saved in article form
- [ ] Article created with correct image URL
- [ ] Image displays on homepage

## Common Issues

### Module Not Found: react-easy-crop
**Solution:** Run `npm install react-easy-crop`

### Upload Error: Bucket Not Found
**Solution:** Create `images` bucket in Supabase Dashboard (Storage > New bucket)

### Upload Error: Permission Denied
**Solution:** Make bucket public or add upload policy for authenticated users

### Image Not Displaying
**Solution:** Check bucket is public and URL is correct format

### Crop Not Working
**Solution:** Ensure image is loaded (check browser console for CORS errors)

## Customization

**Change aspect ratio:**
```tsx
<Cropper
  aspect={4 / 3}  // or 1 / 1 for square
  // ...
/>
```

**Change output quality:**
```tsx
canvas.toBlob((blob) => resolve(blob), 'image/jpeg', 0.95) // 95% quality
```

**Change bucket:**
```tsx
await supabase.storage.from('article-images').upload(...)
```

**Add file size validation:**
```tsx
const onFileChange = (e) => {
  const file = e.target.files?.[0]
  if (!file) return
  
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    alert('File too large')
    return
  }
  
  // ... rest of code
}
```

<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'documentable_type' => 'required|string',
            'documentable_id' => 'required|integer',
        ]);

        $modelClass = "App\\Models\\" . $request->documentable_type;
        if (!class_exists($modelClass)) {
            abort(404);
        }

        $model = $modelClass::findOrFail($request->documentable_id);
        
        return response()->json($model->documents()->latest()->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'documentable_type' => 'required|string',
            'documentable_id' => 'required|integer',
            'type' => 'required|string',
            'file' => 'required|file|max:10240', // 10MB max
        ]);

        $modelClass = "App\\Models\\" . $request->documentable_type;
        if (!class_exists($modelClass)) {
            abort(404, 'Invalid model type');
        }

        $model = $modelClass::findOrFail($request->documentable_id);
        $file = $request->file('file');
        
        $folder = strtolower($request->documentable_type) . 's/' . $model->id . '/documents';
        $filename = \Illuminate\Support\Str::random(40) . '.' . $file->getClientOriginalExtension();
        
        $path = $file->storeAs($folder, $filename, 'public');

        $document = $model->documents()->create([
            'user_id' => auth()->id(),
            'type' => $request->type,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size' => $file->getSize(),
        ]);

        if ($request->wantsJson() || $request->ajax()) {
            return response()->json(['document' => $document]);
        }

        return redirect()->back()->with('success', 'Document ajouté avec succès');
    }

    public function show(\App\Models\Document $document)
    {
        if (str_starts_with($document->file_path, 'legacy/')) {
            $filename = str_replace('legacy/', '', $document->file_path);
            $type = strtolower(class_basename($document->documentable_type)) . 's';
            $mat = $document->documentable->mat ?? $document->documentable->matricule ?? $document->documentable->id;
            return redirect("https://www.lavoiejob.ma/assets/static/{$type}/{$mat}/{$filename}");
        }

        if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'File not found');
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->response($document->file_path);
    }

    public function download(\App\Models\Document $document)
    {
        if (str_starts_with($document->file_path, 'legacy/')) {
            $filename = str_replace('legacy/', '', $document->file_path);
            $type = strtolower(class_basename($document->documentable_type)) . 's';
            $mat = $document->documentable->mat ?? $document->documentable->matricule ?? $document->documentable->id;
            return redirect("https://www.lavoiejob.ma/assets/static/{$type}/{$mat}/{$filename}");
        }

        if (!\Illuminate\Support\Facades\Storage::disk('public')->exists($document->file_path)) {
            abort(404, 'File not found');
        }

        return \Illuminate\Support\Facades\Storage::disk('public')->download($document->file_path, $document->file_name);
    }

    public function destroy(\App\Models\Document $document)
    {
        if (\Illuminate\Support\Facades\Storage::disk('public')->exists($document->file_path)) {
            \Illuminate\Support\Facades\Storage::disk('public')->delete($document->file_path);
        }
        
        $document->delete();

        return redirect()->back()->with('success', 'Document supprimé avec succès');
    }
}

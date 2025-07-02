'use client';

import { useState } from 'react';
import { 
  XMarkIcon, 
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  BookmarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

export default function ImportExportModal({ 
  isOpen, 
  onClose, 
  collection,
  onImportSuccess
}) {
  const [activeTab, setActiveTab] = useState('export');
  const [importData, setImportData] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format) => {
    try {
      setExporting(true);
      
      const response = await fetch(`/api/collections/${collection._id}/export?format=${format}`);
      if (!response.ok) throw new Error('Export failed');
      
      const data = await response.json();
      
      let content, filename, mimeType;
      
      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        filename = `${collection.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        mimeType = 'application/json';
      } else if (format === 'csv') {
        content = convertToCSV(data.items);
        filename = `${collection.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.csv`;
        mimeType = 'text/csv';
      }
      
      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const convertToCSV = (items) => {
    const headers = ['Title', 'URL', 'Category', 'Description', 'Tags', 'Added Date'];
    const rows = items.map(item => [
      item.productId?.title || '',
      item.productId?.url || '',
      item.productId?.category || '',
      item.productId?.description || '',
      item.productId?.metadata?.tags?.join('; ') || '',
      new Date(item.createdAt).toISOString()
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');
      
    return csvContent;
  };

  const handleImportFromText = async () => {
    if (!importData.trim()) return;
    
    try {
      setImporting(true);
      
      let items;
      try {
        // Try to parse as JSON
        const parsed = JSON.parse(importData);
        items = parsed.items || parsed;
      } catch {
        // Try to parse as URLs (one per line)
        const urls = importData.split('\n')
          .map(line => line.trim())
          .filter(line => line && (line.startsWith('http') || line.startsWith('www')));
        items = urls;
      }
      
      const response = await fetch(`/api/collections/${collection._id}/import`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items, source: 'manual' }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (onImportSuccess) {
          onImportSuccess(result.imported);
        }
        setImportData('');
        onClose();
      }
    } catch (error) {
      console.error('Import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleFileImport = async () => {
    if (!importFile) return;
    
    try {
      setImporting(true);
      
      const formData = new FormData();
      formData.append('file', importFile);
      
      const response = await fetch(`/api/collections/${collection._id}/import`, {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        if (onImportSuccess) {
          onImportSuccess(result.imported);
        }
        setImportFile(null);
        onClose();
      }
    } catch (error) {
      console.error('File import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleImportBookmarks = async () => {
    try {
      setImporting(true);
      
      // This would typically involve browser APIs or file upload
      // For now, we'll show instructions
      alert('To import bookmarks:\n1. Export bookmarks from your browser as HTML\n2. Use the file upload option\n3. Or copy bookmark URLs and paste them in the text area');
      
    } catch (error) {
      console.error('Bookmark import error:', error);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setImportData('');
    setImportFile(null);
    setActiveTab('export');
    onClose();
  };

  if (!isOpen || !collection) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg transform transition-all">
          <Card className="p-6 card-theme">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-theme-text">
                Import & Export
              </h3>
              <button
                onClick={handleClose}
                className="text-theme-text-secondary hover:text-theme-text transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex mb-6 bg-theme-secondary/20 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('export')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'export'
                    ? 'bg-theme-primary text-white'
                    : 'text-theme-text-secondary hover:text-theme-text'
                }`}
              >
                <DocumentArrowDownIcon className="h-4 w-4 mr-2 inline" />
                Export
              </button>
              <button
                onClick={() => setActiveTab('import')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'import'
                    ? 'bg-theme-primary text-white'
                    : 'text-theme-text-secondary hover:text-theme-text'
                }`}
              >
                <DocumentArrowUpIcon className="h-4 w-4 mr-2 inline" />
                Import
              </button>
            </div>

            {/* Export Tab */}
            {activeTab === 'export' && (
              <div className="space-y-4">
                <p className="text-sm text-theme-text-secondary">
                  Export your collection data in different formats
                </p>
                
                <div className="space-y-3">
                  <Button
                    onClick={() => handleExport('json')}
                    variant="outline"
                    className="w-full btn-outline-primary flex items-center justify-between"
                    disabled={exporting}
                  >
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">JSON Format</div>
                        <div className="text-xs text-theme-text-secondary">
                          Complete data with metadata
                        </div>
                      </div>
                    </div>
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    onClick={() => handleExport('csv')}
                    variant="outline"
                    className="w-full btn-outline-primary flex items-center justify-between"
                    disabled={exporting}
                  >
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-5 w-5 mr-3" />
                      <div className="text-left">
                        <div className="font-medium">CSV Format</div>
                        <div className="text-xs text-theme-text-secondary">
                          Spreadsheet compatible
                        </div>
                      </div>
                    </div>
                    <DocumentArrowDownIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Import Tab */}
            {activeTab === 'import' && (
              <div className="space-y-6">
                <p className="text-sm text-theme-text-secondary">
                  Import items into your collection from various sources
                </p>
                
                {/* Import from Text */}
                <div>
                  <h4 className="font-medium text-theme-text mb-2">Import from Text</h4>
                  <textarea
                    placeholder="Paste URLs (one per line) or JSON data..."
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-theme-border rounded-lg bg-theme-secondary/10 text-theme-text placeholder-theme-text-secondary focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-transparent resize-none"
                  />
                  <Button
                    onClick={handleImportFromText}
                    className="mt-2 btn-primary"
                    disabled={!importData.trim() || importing}
                  >
                    {importing ? 'Importing...' : 'Import Text'}
                  </Button>
                </div>

                {/* Import from File */}
                <div>
                  <h4 className="font-medium text-theme-text mb-2">Import from File</h4>
                  <div className="border-2 border-dashed border-theme-border rounded-lg p-4 text-center">
                    <input
                      type="file"
                      accept=".json,.csv,.html"
                      onChange={(e) => setImportFile(e.target.files[0])}
                      className="hidden"
                      id="file-import"
                    />
                    <label htmlFor="file-import" className="cursor-pointer">
                      <DocumentArrowUpIcon className="h-8 w-8 text-theme-text-secondary mx-auto mb-2" />
                      <p className="text-sm text-theme-text-secondary">
                        Click to select JSON, CSV, or HTML file
                      </p>
                      {importFile && (
                        <p className="text-sm text-theme-primary mt-1">
                          Selected: {importFile.name}
                        </p>
                      )}
                    </label>
                  </div>
                  <Button
                    onClick={handleFileImport}
                    className="mt-2 btn-primary"
                    disabled={!importFile || importing}
                  >
                    {importing ? 'Importing...' : 'Import File'}
                  </Button>
                </div>

                {/* Import Bookmarks */}
                <div>
                  <h4 className="font-medium text-theme-text mb-2">Import Bookmarks</h4>
                  <Button
                    onClick={handleImportBookmarks}
                    variant="outline"
                    className="w-full btn-outline-primary flex items-center justify-center"
                    disabled={importing}
                  >
                    <BookmarkIcon className="h-5 w-5 mr-2" />
                    Import Browser Bookmarks
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

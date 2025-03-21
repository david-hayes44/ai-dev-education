import { useState, useEffect } from 'react';
import { ReportState, ReportSectionKey } from './types';
import { Copy, Download, Check, Calendar, Clock } from 'lucide-react';

interface ReportEditorProps {
  reportState: ReportState;
  onReportChange: (reportState: ReportState) => void;
}

export default function ReportEditor({ reportState, onReportChange }: ReportEditorProps) {
  const [copied, setCopied] = useState(false);
  const [activeSection, setActiveSection] = useState<ReportSectionKey | null>(null);
  const [localReport, setLocalReport] = useState<ReportState>(reportState);
  
  // Sync the local report state with the incoming reportState when it changes from outside
  useEffect(() => {
    setLocalReport(reportState);
  }, [reportState]);
  
  const handleSectionChange = (section: ReportSectionKey, content: string) => {
    const updatedReport = {
      ...localReport,
      sections: {
        ...localReport.sections,
        [section]: content
      },
      metadata: {
        ...localReport.metadata,
        lastUpdated: Date.now()
      }
    };
    
    setLocalReport(updatedReport);
    onReportChange(updatedReport);
  };
  
  const handleTitleChange = (title: string) => {
    const updatedReport = {
      ...localReport,
      title,
      metadata: {
        ...localReport.metadata,
        lastUpdated: Date.now()
      }
    };
    
    setLocalReport(updatedReport);
    onReportChange(updatedReport);
  };
  
  const handleDateChange = (date: string) => {
    const updatedReport = {
      ...localReport,
      date,
      metadata: {
        ...localReport.metadata,
        lastUpdated: Date.now()
      }
    };
    
    setLocalReport(updatedReport);
    onReportChange(updatedReport);
  };
  
  const copyToClipboard = () => {
    const reportText = `
# ${localReport.title}
Date: ${localReport.date}

## Accomplishments Since Last Update
${localReport.sections.accomplishments}

## Insights / Learnings
${localReport.sections.insights}

## Decisions / Risks / Resources Required
${localReport.sections.decisions}

## Next Steps / Upcoming Tasks
${localReport.sections.nextSteps}
    `.trim();
    
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  const formatDate = () => {
    const now = new Date();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const month = monthNames[now.getMonth()];
    const day = now.getDate();
    const year = now.getFullYear();
    
    const getOrdinalSuffix = (d: number) => {
      if (d > 3 && d < 21) return 'th';
      switch (d % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };
    
    return `${month} ${day}${getOrdinalSuffix(day)} ${year}`;
  };
  
  // Auto-generate current date in specified format when component mounts
  useEffect(() => {
    if (!localReport.date) {
      handleDateChange(formatDate());
    }
  }, []);
  
  return (
    <div className="report-editor flex flex-col h-full border rounded-lg overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
      <div className="p-4 border-b bg-slate-50 dark:bg-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium dark:text-gray-200">4-Box Report</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400">Status report based on your documents</p>
        </div>
        <div className="flex gap-2">
          <button 
            className="flex items-center gap-1 py-2 px-3 rounded-md hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 text-sm border border-slate-300 dark:border-gray-600"
            aria-label="Export report"
            onClick={() => {/* Implement export functionality */}}
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button 
            className={`flex items-center gap-1 py-2 px-3 rounded-md ${
              copied 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700' 
                : 'hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-600 dark:text-gray-300 border border-slate-300 dark:border-gray-600'
            }`}
            aria-label="Copy report"
            onClick={copyToClipboard}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-4 overflow-auto dark:bg-gray-900">
        {/* Report Header */}
        <div className="border-b pb-4 mb-4 dark:border-gray-700">
          <input 
            type="text"
            className="w-full text-xl font-semibold border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded bg-white dark:bg-gray-900 dark:text-gray-200"
            placeholder="Project or Team Name"
            value={localReport.title}
            onChange={(e) => handleTitleChange(e.target.value)}
          />
          <div className="flex justify-end text-slate-500 dark:text-gray-400 text-sm items-center mt-2">
            <Calendar className="h-4 w-4 mr-1" />
            <input
              type="text"
              className="text-right border-0 focus:outline-none focus:ring-1 focus:ring-blue-500 p-1 rounded bg-transparent text-slate-500 dark:text-gray-400 text-sm w-40"
              value={localReport.date}
              onChange={(e) => handleDateChange(e.target.value)}
            />
          </div>
        </div>
        
        {/* Report Sections - Stacked Vertically */}
        <div className="space-y-4">
          {/* Accomplishments */}
          <div 
            className={`border dark:border-gray-700 rounded-md overflow-hidden shadow-sm ${activeSection === 'accomplishments' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveSection('accomplishments')}
          >
            <div className="bg-blue-900 text-white p-2.5 font-medium text-sm">
              Accomplishments Since Last Update
            </div>
            <div className="p-3 bg-white dark:bg-gray-800">
              <textarea 
                className="w-full border-0 focus:outline-none focus:ring-0 p-0 text-sm min-h-[120px] resize-none bg-white dark:bg-gray-800 dark:text-gray-200" 
                placeholder="Explain what has happened since last report out. Successes etc."
                value={localReport.sections.accomplishments}
                onChange={(e) => handleSectionChange('accomplishments', e.target.value)}
              ></textarea>
            </div>
          </div>
          
          {/* Insights */}
          <div 
            className={`border dark:border-gray-700 rounded-md overflow-hidden shadow-sm ${activeSection === 'insights' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveSection('insights')}
          >
            <div className="bg-blue-900 text-white p-2.5 font-medium text-sm">
              Insights / Learnings
            </div>
            <div className="p-3 bg-white dark:bg-gray-800">
              <textarea 
                className="w-full border-0 focus:outline-none focus:ring-0 p-0 text-sm min-h-[120px] resize-none bg-white dark:bg-gray-800 dark:text-gray-200" 
                placeholder="Valuable 'Ah Ha' moments where new info was uncovered etc."
                value={localReport.sections.insights}
                onChange={(e) => handleSectionChange('insights', e.target.value)}
              ></textarea>
            </div>
          </div>
          
          {/* Decisions */}
          <div 
            className={`border dark:border-gray-700 rounded-md overflow-hidden shadow-sm ${activeSection === 'decisions' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveSection('decisions')}
          >
            <div className="bg-blue-900 text-white p-2.5 font-medium text-sm">
              Decisions / Risks / Resources Required
            </div>
            <div className="p-3 bg-white dark:bg-gray-800">
              <textarea 
                className="w-full border-0 focus:outline-none focus:ring-0 p-0 text-sm min-h-[120px] resize-none bg-white dark:bg-gray-800 dark:text-gray-200" 
                placeholder="Roadblocks, help needed, escalations or decisions..."
                value={localReport.sections.decisions}
                onChange={(e) => handleSectionChange('decisions', e.target.value)}
              ></textarea>
            </div>
          </div>
          
          {/* Next Steps */}
          <div 
            className={`border dark:border-gray-700 rounded-md overflow-hidden shadow-sm ${activeSection === 'nextSteps' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setActiveSection('nextSteps')}
          >
            <div className="bg-blue-900 text-white p-2.5 font-medium text-sm">
              Next Steps / Upcoming Tasks
            </div>
            <div className="p-3 bg-white dark:bg-gray-800">
              <textarea 
                className="w-full border-0 focus:outline-none focus:ring-0 p-0 text-sm min-h-[120px] resize-none bg-white dark:bg-gray-800 dark:text-gray-200" 
                placeholder="Upcoming week's work ahead..."
                value={localReport.sections.nextSteps}
                onChange={(e) => handleSectionChange('nextSteps', e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
        
        {/* Last updated timestamp */}
        <div className="mt-4 text-xs text-right text-slate-400 flex items-center justify-end">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: {localReport.metadata.lastUpdated ? new Date(localReport.metadata.lastUpdated).toLocaleString() : 'Never'}
        </div>
      </div>
    </div>
  );
} 
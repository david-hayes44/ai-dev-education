-- Create the reports table to store report metadata and status
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY,
  status TEXT NOT NULL, -- 'pending', 'processing', 'completed', 'error'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  project_context TEXT,
  result JSONB, -- Stores the final ReportState
  error TEXT -- Error message if status is 'error'
);

-- Create the report_documents table to store documents associated with reports
CREATE TABLE IF NOT EXISTS report_documents (
  id UUID PRIMARY KEY,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_type TEXT,
  document_size INTEGER,
  text_content TEXT,
  summary TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_report_documents_report_id ON report_documents (report_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports (status);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports (created_at);

-- Row Level Security policies to ensure only authorized users can access reports
-- Enable RLS on the tables
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_documents ENABLE ROW LEVEL SECURITY;

-- Allow any authenticated user to see any report (adjust this based on your security needs)
CREATE POLICY "Allow authenticated users to read all reports" 
  ON reports FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert reports" 
  ON reports FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update reports" 
  ON reports FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete reports" 
  ON reports FOR DELETE USING (auth.role() = 'authenticated');

-- Apply similar policies for report_documents
CREATE POLICY "Allow authenticated users to read report documents" 
  ON report_documents FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert report documents" 
  ON report_documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update report documents" 
  ON report_documents FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete report documents" 
  ON report_documents FOR DELETE USING (auth.role() = 'authenticated');

-- Create a function to automatically update the 'updated_at' field
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function when reports are updated
CREATE TRIGGER update_reports_modtime
BEFORE UPDATE ON reports
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- If anonymous access is needed (e.g., for development), you can add these policies
-- WARNING: Only use in development or if you have other security measures
CREATE POLICY "Allow anonymous users to read reports" 
  ON reports FOR SELECT USING (true);

CREATE POLICY "Allow anonymous users to insert reports" 
  ON reports FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous users to update reports" 
  ON reports FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous users to delete reports" 
  ON reports FOR DELETE USING (true);

CREATE POLICY "Allow anonymous users to read report documents" 
  ON report_documents FOR SELECT USING (true);

CREATE POLICY "Allow anonymous users to insert report documents" 
  ON report_documents FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous users to update report documents" 
  ON report_documents FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous users to delete report documents" 
  ON report_documents FOR DELETE USING (true);

-- Comment: You may want to disable anonymous policies in production
-- For production, consider using more restrictive policies based on user IDs 
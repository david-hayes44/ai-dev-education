import { promises as fs } from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';

interface PageProps {
  params: {
    slug: string[];
  };
}

export default async function DocPage({ params }: PageProps) {
  const slug = params.slug.join('/');
  
  // Construct the file path
  const filePath = path.join(process.cwd(), 'public', 'docs', `${slug}`);
  
  // Check if the file exists
  try {
    const fileContent = await fs.readFile(filePath, 'utf8');
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="prose max-w-none">
          <MDXRemote source={fileContent} />
        </div>
      </div>
    );
  } catch (error) {
    console.error(`Error reading markdown file: ${error}`);
    notFound();
  }
} 
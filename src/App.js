import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";

function App() {
  // State variables for form inputs and API response
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [matchedResume, setMatchedResume] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle the resume matching process
  const handleMatch = async () => {
    setIsLoading(true);
    try {
      // Input validation
      if (!jobDescription.trim() || !resume.trim()) {
        throw new Error('Please provide both job description and resume.');
      }

      // Call OpenAI API to match resume with job description
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant that matches resumes to job descriptions. Your task is to analyze the given resume and job description, then provide a tailored version of the resume that highlights relevant skills and experiences for the job. After the tailored resume, provide a summary of the changes made and the reasoning behind them." },
            { role: "user", content: `Job Description: ${jobDescription}\n\nResume: ${resume}\n\nPlease provide a tailored version of the resume that matches the job description, followed by a summary of changes and reasoning.` }
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Improved error handling and response parsing
      if (response.data && response.data.choices && response.data.choices[0] && response.data.choices[0].message) {
        const fullResponse = response.data.choices[0].message.content;
        const [updatedResume, changeSummary] = fullResponse.split('Summary of Changes:');
        
        setMatchedResume(updatedResume ? updatedResume.trim() : 'No matched resume provided.');
        setSummary(changeSummary ? changeSummary.trim() : 'No summary provided.');
      } else {
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      setMatchedResume('An error occurred while matching the resume. Please try again.');
      setSummary(`Error details: ${error.message}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <h1 className="text-3xl font-bold">Resume Matcher</h1>
      </header>
      
      <main className="container mx-auto p-6 max-w-5xl">
        {/* Input forms for job description and resume */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-800">Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Paste job description here" 
                value={jobDescription} 
                onChange={(e) => setJobDescription(e.target.value)}
                className="h-48 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle className="text-blue-800">Your Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Paste your resume here" 
                value={resume} 
                onChange={(e) => setResume(e.target.value)}
                className="h-48 border-slate-200 focus:border-blue-400 focus:ring-blue-400"
              />
            </CardContent>
          </Card>
        </div>
        
        {/* Button to trigger resume matching */}
        <Button 
          onClick={handleMatch} 
          className="mb-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 ease-in-out"
          disabled={isLoading}
        >
          {isLoading ? 'Matching...' : 'Match Resume'}
        </Button>
        
        {/* Display matched resume and summary if available */}
        {matchedResume && (
          <>
            <Card className="mb-6 bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-blue-800">Matched Resume</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-slate-700">{matchedResume}</pre>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="text-blue-800">Summary of Changes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose text-slate-700">
                  {summary.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
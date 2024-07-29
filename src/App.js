import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Button } from "./components/ui/button";
import { Textarea } from "./components/ui/textarea";

function App() {
  const [jobDescription, setJobDescription] = useState('');
  const [resume, setResume] = useState('');
  const [matchedResume, setMatchedResume] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMatch = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a helpful assistant that matches resumes to job descriptions. Your task is to analyze the given resume and job description, then provide a tailored version of the resume that highlights relevant skills and experiences for the job." },
            { role: "user", content: `Job Description: ${jobDescription}\n\nResume: ${resume}\n\nPlease provide a tailored version of the resume that matches the job description.` }
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMatchedResume(response.data.choices[0].message.content);
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      setMatchedResume('An error occurred while matching the resume. Please try again.');
    }
    setIsLoading(false);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Resume Matcher</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Paste job description here" 
              value={jobDescription} 
              onChange={(e) => setJobDescription(e.target.value)}
              className="h-48"
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              placeholder="Paste your resume here" 
              value={resume} 
              onChange={(e) => setResume(e.target.value)}
              className="h-48"
            />
          </CardContent>
        </Card>
      </div>
      
      <Button onClick={handleMatch} className="mb-4" disabled={isLoading}>
        {isLoading ? 'Matching...' : 'Match Resume'}
      </Button>
      
      {matchedResume && (
        <Card>
          <CardHeader>
            <CardTitle>Matched Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap">{matchedResume}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default App;
'use client';

import { useState } from 'react';
import axios from 'axios';

export default function TestPage() {
    const [result, setResult] = useState('');
    const [loading, setLoading] = useState(false);

    const testDirect = async () => {
        setLoading(true);
        setResult('Testing...');

        try {
            // Test langsung dengan axios tanpa httpClient
            const response = await axios.post('http://localhost:8081/auth/login', {
                username: 'jurubuku',
                password: 'password123'
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            setResult(JSON.stringify(response.data, null, 2));
        } catch (error: any) {
            setResult(`Error: ${error.message}\nCode: ${error.code}\nResponse: ${JSON.stringify(error.response?.data, null, 2)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Backend Connection Test</h1>

            <button
                onClick={testDirect}
                disabled={loading}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {loading ? 'Testing...' : 'Test Direct Axios Call'}
            </button>

            <div className="mt-4 p-4 bg-gray-100 rounded">
                <h2 className="font-bold mb-2">Result:</h2>
                <pre className="whitespace-pre-wrap">{result || 'Click button to test'}</pre>
            </div>

            <div className="mt-4 p-4 bg-yellow-50 rounded">
                <h2 className="font-bold mb-2">Info:</h2>
                <p>Backend URL: http://localhost:8081</p>
                <p>Endpoint: /auth/login</p>
                <p>Username: jurubuku</p>
                <p>Password: password123</p>
            </div>
        </div>
    );
}

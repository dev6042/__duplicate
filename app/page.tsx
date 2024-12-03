/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use client";

import { useState } from "react";
import { sendMessage, MessageData } from "./vertex";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface FormData {
  file: File | null;
  prompt: string;
}

export default function Home() {
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    file: null,
    prompt: "",
  });

  async function handleProcessing(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setLoading(true);
    try {
      setError(null);
      if (!formData.file) {
        setError("No file specified");
        return;
      }
      const fileData = Buffer.from(await formData.file.arrayBuffer()).toString(
        "base64"
      );
      const f = {
        file: {
          contents: fileData,
          type: formData.file.type,
        },
        prompt: formData.prompt,
      } as MessageData;
      const r = await sendMessage(f);
      setResponse(r);
    } catch (error) {
      setError(`${error}`);
    } finally {
      setLoading(false);
    }
  }

  function handleInputChange(field: string, value: string | FileList) {
    setFormData({ ...formData, [field]: value });
  }

  function handleFileChange(files: FileList | null) {
    if (files) {
      setFormData({ ...formData, file: files[0] });
    }
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="bg-white shadow-lg rounded-lg px-10 py-8 max-w-lg w-full">
          {error && (
            <div
              className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50"
              role="alert"
            >
              <strong>Error:</strong> {error}
            </div>
          )}

          <form onSubmit={handleProcessing} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-bold mb-2">
                Ask about your nutrition:
              </label>
              <div className="flex items-center">
                <input
                  disabled={loading}
                  type="text"
                  name="prompt"
                  placeholder="e.g. Is this good for me?"
                  className="shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 focus:outline-none"
                  required
                  onChange={(e) =>
                    handleInputChange("prompt", e.target.value)
                  }
                />
                <span className="p-2 bg-gray-100 border rounded-r">
                  <i className="fas fa-question-circle text-gray-500"></i>
                </span>
              </div>
            </div>

            <div>
              {/* <label className="block text-gray-700 font-bold mb-2">
                Upload File:
              </label>
              <input
                type="file"
                disabled={loading}
                accept=".pdf,.jpg,.jpeg,.png,.mp4,.wav,.m4v"
                name="file"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
                required
                onChange={(e) => handleFileChange(e.target.files)}
              /> */}
              {formData.file && (
                <div className="p-4 text-sm text-gray-800 rounded-lg bg-gray-50 dark:bg-gray-800 dark:text-gray-300 mb-2 font-bold" role="alert">
                  {formData.file.name}
                </div>
              )}
              <div
                className={`border-2 border-dashed rounded-lg p-4 flex justify-center items-center transition-all ${
                  loading
                    ? "border-gray-300 bg-gray-100"
                    : "border-gray-500 bg-gray-50 hover:bg-gray-100"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (!loading) {
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      handleFileChange(files);
                    }
                  }
                }}
              >
                <input
                  type="file"
                  disabled={loading}
                  accept=".pdf,.jpg,.jpeg,.png,.mp4,.wav,.m4v"
                  name="file"
                  className="hidden"
                  id="file-upload"
                  onChange={(e) => handleFileChange(e.target.files)}
                />
                <label
                  htmlFor="file-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <span
                    className={`text-gray-700 font-bold ${
                      loading ? "cursor-not-allowed" : ""
                    }`}
                  >
                    Drag & Drop your file here
                  </span>
                  <span className="text-sm text-gray-500 mt-1">or click to browse</span>
                </label>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                For example:{" "}
                <a
                  href="https://storage.googleapis.com/q4-24-techie-meetup/images/ingredients.jpg"
                  className="text-blue-600 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  A drink&apos;s ingredients list
                </a>
              </p>
            </div>

            <div className="flex items-center justify-between">
              <button
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded focus:outline-none"
                type="submit"
              >
                {loading ? (
                  <span>
                    <i className="fas fa-spinner animate-spin mr-2"></i>
                    Processing...
                  </span>
                ) : (
                  "Analyze"
                )}
              </button>
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
                onClick={() => setFormData({ file: null, prompt: "" })}
              >
                Clear
              </button>
            </div>
          </form>

          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-6 bg-gray-50 p-4 rounded-lg shadow-md"
            >
              <ReactMarkdown>{response}</ReactMarkdown>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}

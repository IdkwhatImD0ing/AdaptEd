"use client";

import { useEffect, useState } from "react";

type Task = {
  title: string;
  url?: string;
  status: "todo" | "inprogress" | "done";
  subtasks: string[];
};

export default function page() {
  useEffect(() => {
    const generateLecture = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const topic = decodeURIComponent(urlParams.get("topic") || "");
        const response = await fetch("http://localhost:8000/generate-simple", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ topic: topic }),
        });

        if (response.ok) {
          const lecture = await response.json();
          console.log("Generated lecture:", lecture);
          localStorage.setItem("lecture", JSON.stringify(lecture));
          // Update the tasks state with the research tasks from the lecture
          setTasks(lecture.research_tasks);
          // Store the lecture data in the user's account database via pymongo
          const response2 = await fetch(
            "http://localhost:8000/api/store-lecture",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(lecture),
            }
          );
          console.log(response2); // Process your response further
          window.location.href = "/lecture";
        } else {
          console.error("Error generating lecture:", response.statusText);
        }
      } catch (error) {
        console.error("Error generating lecture:", error);
      }
    };

    generateLecture();
  }, []);

  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentTask, setCurrentTask] = useState<string | null>(
    "Research Google"
  );
  const [currentSubtask, setCurrentSubtask] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks];
        const currentTaskIndex = updatedTasks.findIndex(
          (task) => task.title === currentTask
        );

        if (currentTaskIndex !== -1) {
          const currentTaskObj = updatedTasks[currentTaskIndex];
          const currentSubtaskIndex = currentTaskObj.subtasks.findIndex(
            (subtask) => subtask === currentSubtask
          );

          if (currentSubtaskIndex !== -1) {
            const nextSubtaskIndex =
              (currentSubtaskIndex + 1) % currentTaskObj.subtasks.length;
            setCurrentSubtask(currentTaskObj.subtasks[nextSubtaskIndex]);

            if (nextSubtaskIndex === 0) {
              const nextTaskIndex =
                (currentTaskIndex + 1) % updatedTasks.length;
              const nextTask = updatedTasks[nextTaskIndex];
              setCurrentTask(nextTask.title);
              setCurrentSubtask(nextTask.subtasks[0]);
            }
          } else {
            setCurrentSubtask(currentTaskObj.subtasks[0]);
          }
        }

        return updatedTasks;
      });
    }, Math.floor(Math.random() * 4000) + 2000);

    return () => {
      clearInterval(interval);
    };
  }, [currentTask, currentSubtask]);
  return (
    <main className="min-h-screen">
      <div className="flex p-20 gap-20">
        <div className="w-[400px]">
          <h1 className="text-3xl font-bold">Researching...</h1>
          <h1 className="text-2xl mt-4">
            Gathing information from a variety of sources to build comprehensive
            interactive lecture.
          </h1>
        </div>
        <div className="w-1/2 flex flex-col items-end">
          <ul className="list-none list-inside max-w-[500px] flex flex-col gap-8">
            {tasks?.map((task, index) => (
              <li key={index}>
                <div
                  className={`flex p-4 border-2 rounded-xl cursor-pointer mb-4 pr-20 overflow-hidden ${
                    currentTask === task.title
                      ? "bg-purple-500"
                      : tasks.indexOf(task) <
                        tasks.findIndex((t) => t.title === currentTask)
                      ? "bg-gray-800"
                      : "border-gray-500"
                  }`}
                >
                  <img
                    alt="Favicon"
                    src={
                      "https://www.google.com/s2/favicons?domain=" + task.url
                    }
                    className="w-8 h-8 mr-4"
                  />
                  <div>
                    <h1 className="text-2xl font-bold "> {task.title}</h1>
                    <h2 className="text-xl opacity-75">{task.url}</h2>
                  </div>
                </div>
                {task.subtasks.length > 0 && (
                  <ul className="list-none list-inside ml-8 flex flex-col gap-2">
                    {task.subtasks.map((subtask, subIndex) => (
                      <li
                        key={subIndex}
                        className={`text-lg p-4 border-2 rounded-xl cursor-pointer ${
                          currentSubtask === subtask
                            ? "bg-purple-500"
                            : task.subtasks.indexOf(subtask) <
                                task.subtasks.findIndex(
                                  (s) => s === currentSubtask
                                ) ||
                              tasks.indexOf(task) <
                                tasks.findIndex((t) => t.title === currentTask)
                            ? "bg-gray-800"
                            : "border-gray-500"
                        }`}
                      >
                        {subtask}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>

        <div className="w-1/2">
          <img
            src={
              "https://image.thum.io/get/" +
              tasks.find((task) => task.title === currentTask)?.url
            }
            alt="Research Image"
            className="w-full h-auto rounded-xl"
          />
          <p className="text-center italic mt-4">
            {tasks.find((task) => task.title === currentTask)?.title} -{" "}
            {tasks.find((task) => task.title === currentTask)?.url}
          </p>
          {currentSubtask && (
            <p className="text-center mt-4">
              Current Subtask: {currentSubtask}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

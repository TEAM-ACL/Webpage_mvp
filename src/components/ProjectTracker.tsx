// ACL: VisionTech project tracker component

import type { UserProject } from "../types/projects";

interface Props {
  projects: UserProject[];
}

export default function ProjectTracker({ projects }: Props) {
  if (projects.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-800">
          No projects tracked yet.
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Add a project to show how you are applying your skills.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <div
          key={project.id}
          className="rounded-xl border border-slate-200 p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-slate-900">
                {project.title}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {project.description}
              </p>
            </div>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
              {project.status}
            </span>
          </div>

          <p className="mt-3 text-sm text-slate-600">
            Category: {project.category}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {project.skills_used.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs text-blue-700"
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="mt-4">
            <p className="text-sm text-slate-700">
              Progress: {project.progress_percent}%
            </p>

            <div className="mt-1 h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-blue-500"
                style={{
                  width: `${project.progress_percent}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            {project.github_url ? (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                GitHub
              </a>
            ) : null}

            {project.demo_url ? (
              <a
                href={project.demo_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                Demo
              </a>
            ) : null}

            {project.documentation_url ? (
              <a
                href={project.documentation_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline"
              >
                Documentation
              </a>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}


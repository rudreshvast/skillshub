import api from "@/app/lib/api";
import {
  AllocationCreate,
  AllocationMember,
  AllocationUpdate,
  ProjectListItem,
} from "@/app/types/project";
import { EmployeeListItem } from "@/app/types/employee";

export async function searchEmployees(
  searchQuery: string
): Promise<EmployeeListItem[]> {
  const res = await api.get("/employees", {
    params: { search: searchQuery },
  });
  return res.data.employees;
}

export async function getProjects(): Promise<ProjectListItem[]> {
  const res = await api.get("/projects");
  return res.data;
}

export async function addAllocation(
  projectId: number,
  data: AllocationCreate
): Promise<AllocationMember> {
  const res = await api.post(`/projects/${projectId}/allocations`, data);
  return res.data;
}

export async function updateAllocation(
  projectId: number,
  allocationId: number,
  data: AllocationUpdate
): Promise<AllocationMember> {
  const res = await api.patch(
    `/projects/${projectId}/allocations/${allocationId}`,
    data
  );
  return res.data;
}

export async function removeAllocation(
  projectId: number,
  allocationId: number
): Promise<void> {
  await api.delete(`/projects/${projectId}/allocations/${allocationId}`);
}

export async function getProject(projectId: number) {
  const res = await api.get(`/projects/${projectId}`);
  return res.data;
}

export async function createProject(data: {
  name: string;
  description?: string;
  status?: string;
  start_date?: string | null;
  end_date?: string | null;
}) {
  const res = await api.post("/projects", data);
  return res.data;
}

export async function updateProject(
  projectId: number,
  data: {
    name?: string;
    description?: string;
    status?: string;
    start_date?: string | null;
    end_date?: string | null;
  }
) {
  const res = await api.patch(`/projects/${projectId}`, data);
  return res.data;
}

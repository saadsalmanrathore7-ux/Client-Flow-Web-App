import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus } from "lucide-react"

const projects = [
  {
    name: "E-Commerce Website Redesign",
    status: "In Progress",
    statusColor: "bg-stone-200 text-stone-700",
    deadline: "Dec 30",
    budget: "$4,500"
  },
  {
    name: "Mobile App MVP",
    status: "Pending",
    statusColor: "bg-stone-300 text-stone-800",
    deadline: "Jan 15",
    budget: "$8,200"
  },
  {
    name: "Brand Identity Package",
    status: "Completed",
    statusColor: "bg-stone-900 text-white",
    deadline: "Nov 20",
    budget: "$2,100"
  },
  {
    name: "SEO & Marketing Dashboard",
    status: "In Progress",
    statusColor: "bg-stone-200 text-stone-700",
    deadline: "Jan 5",
    budget: "$3,300"
  }
]

export function ProjectsTable() {
  return (
    <div className="animate-fade-up delay-300 rounded-2xl border border-stone-200 bg-white overflow-hidden">
      <div className="p-6 border-b border-stone-200">
        <h3 className="text-lg font-semibold text-stone-900">Recent Projects</h3>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow className="border-stone-200 hover:bg-transparent">
            <TableHead className="text-stone-500">Project</TableHead>
            <TableHead className="text-stone-500">Status</TableHead>
            <TableHead className="text-stone-500">Deadline</TableHead>
            <TableHead className="text-stone-500">Budget</TableHead>
            <TableHead className="text-stone-500 text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project, i) => (
            <TableRow
              key={project.name}
              className="animate-slide-left border-stone-200 hover:bg-stone-50"
              style={{ animationDelay: `${400 + i * 60}ms` }}
            >
              <TableCell className="font-medium text-stone-900">{project.name}</TableCell>
              <TableCell>
                <Badge className={`${project.statusColor} border-0 rounded-full`}>
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell className="text-stone-500">{project.deadline}</TableCell>
              <TableCell className="text-stone-900">{project.budget}</TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-stone-900 hover:text-stone-900 hover:bg-stone-100"
                >
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      
      <div className="p-4 border-t border-stone-200">
        <Button className="w-full h-10 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium transition-all duration-200 hover:scale-[1.01]">
          <Plus className="w-4 h-4 mr-2" />
          Create New Project
        </Button>
      </div>
    </div>
  )
}

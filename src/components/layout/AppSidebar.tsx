import { 
  LayoutDashboard, 
  Bot, 
  Workflow, 
  Plug, 
  Shield, 
  Activity, 
  FileText, 
  Users, 
  Settings,
  ChevronDown,
  Plus
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

const mainNavItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
];

const agentsSubItems = [
  { title: "Agent Registry", url: "/agents" },
  { title: "Agent Builder", url: "/agents/builder" },
  { title: "Agent Permissions", url: "/agents/permissions" },
];

const navGroups = [
  { 
    label: "Operations",
    items: [
      { title: "Workflows", url: "/workflows", icon: Workflow },
      { title: "Integrations", url: "/integrations", icon: Plug },
    ]
  },
  {
    label: "Governance",
    items: [
      { title: "Governance & Safety", url: "/governance", icon: Shield },
      { title: "Monitoring & Costs", url: "/monitoring", icon: Activity },
      { title: "Audit & Compliance", url: "/audit", icon: FileText },
    ]
  },
  {
    label: "Administration",
    items: [
      { title: "Users & Roles", url: "/users", icon: Users },
      { title: "Settings", url: "/settings", icon: Settings },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const isAgentsActive = currentPath.startsWith("/agents");

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarHeader className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-semibold text-foreground">AgentOS</span>
              <span className="text-xs text-muted-foreground">AI Command Center</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={currentPath === item.url}>
                    <NavLink 
                      to={item.url} 
                      end 
                      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent"
                      activeClassName="bg-primary/10 text-primary"
                    >
                      <item.icon className="w-5 h-5" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Agents Collapsible Section */}
        <SidebarGroup>
          <Collapsible defaultOpen={isAgentsActive}>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between px-3 py-2 hover:bg-accent rounded-lg cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5" />
                  {!collapsed && <span>Agents</span>}
                </div>
                {!collapsed && <ChevronDown className="w-4 h-4 transition-transform" />}
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent className="pl-4">
                <SidebarMenu>
                  {agentsSubItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={currentPath === item.url}>
                        <NavLink 
                          to={item.url}
                          className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent text-sm"
                          activeClassName="bg-primary/10 text-primary"
                        >
                          {!collapsed && <span>{item.title}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        {navGroups.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {group.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={currentPath === item.url}>
                      <NavLink 
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors hover:bg-accent"
                        activeClassName="bg-primary/10 text-primary"
                      >
                        <item.icon className="w-5 h-5" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        {!collapsed && (
          <Button className="w-full gap-2">
            <Plus className="w-4 h-4" />
            New Agent
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

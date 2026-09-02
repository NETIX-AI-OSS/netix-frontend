import { ArrowRight, Bell, Check, CreditCard, Plus, Settings2, Sparkles } from 'lucide-react'
import { Fragment, useState } from 'react'
import { PageBreadcrumbs } from '@/components/application/breadcrumbs'
import { PageLayout } from '@/components/application/layout'
import { WorkspaceSidebar } from '@/components/application/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Combobox,
  ComboboxCollection,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
  ComboboxSeparator,
  useComboboxAnchor,
} from '@/components/ui/combobox'
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'

type ComboboxMember = {
  id: string
  name: string
  role: string
  initials: string
}

type ComboboxMemberGroup = {
  value: string
  items: string[]
}

const comboboxMembers: ComboboxMember[] = [
  { id: 'maya-chen', name: 'Maya Chen', role: 'Product design', initials: 'MC' },
  { id: 'jon-bell', name: 'Jon Bell', role: 'Frontend engineering', initials: 'JB' },
  { id: 'priya-shah', name: 'Priya Shah', role: 'Customer operations', initials: 'PS' },
  { id: 'leo-martin', name: 'Leo Martin', role: 'Platform engineering', initials: 'LM' },
  { id: 'sara-kim', name: 'Sara Kim', role: 'Product management', initials: 'SK' },
]

const comboboxGroups: ComboboxMemberGroup[] = [
  { value: 'Product', items: ['maya-chen', 'sara-kim'] },
  { value: 'Engineering', items: ['jon-bell', 'leo-martin'] },
  { value: 'Operations', items: ['priya-shah'] },
]

function ComboboxShowcase() {
  const [owner, setOwner] = useState(comboboxMembers[0].id)
  const anchor = useComboboxAnchor()
  const selectedOwner = comboboxMembers.find((member) => member.id === owner) ?? comboboxMembers[0]

  return (
    <Card className="overflow-hidden py-0">
      <CardContent className="grid gap-0 p-0 lg:grid-cols-[minmax(0,1.15fr)_minmax(220px,0.85fr)]">
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Workspace owner</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Search by name, then browse by team.
              </p>
            </div>
            <Badge variant="secondary">Searchable</Badge>
          </div>

          <div className="mt-5 flex max-w-md flex-col gap-2">
            <Label htmlFor="design-system-owner">Owner</Label>
            <Combobox
              items={comboboxGroups}
              itemToStringLabel={(memberId) =>
                comboboxMembers.find((member) => member.id === memberId)?.name ?? memberId
              }
              itemToStringValue={(memberId) => memberId}
              value={owner}
              onValueChange={(value) => {
                if (value) setOwner(value)
              }}
            >
              <div ref={anchor} className="w-full">
                <ComboboxInput
                  id="design-system-owner"
                  className="w-full"
                  placeholder="Search teammates…"
                />
              </div>
              <ComboboxContent anchor={anchor}>
                <ComboboxEmpty>No teammates found.</ComboboxEmpty>
                <ComboboxList>
                  {(group: ComboboxMemberGroup) => (
                    <Fragment key={group.value}>
                      {group.value !== comboboxGroups[0].value && <ComboboxSeparator />}
                      <ComboboxGroup items={group.items} className="block">
                        <ComboboxLabel>{group.value}</ComboboxLabel>
                        <ComboboxCollection>
                          {(memberId: string) => {
                            const member = comboboxMembers.find((item) => item.id === memberId)
                            if (!member) return null

                            return (
                              <ComboboxItem key={member.id} value={member.id}>
                                <Avatar>
                                  <AvatarFallback className="bg-muted text-xs font-semibold text-foreground">
                                    {member.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="flex min-w-0 flex-1 flex-col">
                                  <span className="truncate font-medium leading-4">
                                    {member.name}
                                  </span>
                                  <span className="truncate text-xs leading-4 text-muted-foreground">
                                    {member.role}
                                  </span>
                                </span>
                              </ComboboxItem>
                            )
                          }}
                        </ComboboxCollection>
                      </ComboboxGroup>
                    </Fragment>
                  )}
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
            <p className="text-xs text-muted-foreground">
              Type to filter, then use ↑ ↓ and Enter to choose.
            </p>
          </div>
        </div>

        <div className="border-t bg-muted/30 p-6 lg:border-t-0 lg:border-l">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
            Selected value
          </p>
          <div className="mt-4 rounded-full bg-muted/50 p-3">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-card text-xs font-semibold text-foreground">
                  {selectedOwner.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{selectedOwner.name}</p>
                <p className="truncate text-xs text-muted-foreground">{selectedOwner.role}</p>
              </div>
              <span className="ml-auto grid size-6 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                <Check className="size-3.5" />
              </span>
            </div>
          </div>
          <p className="mt-4 text-sm leading-5 text-muted-foreground">
            Keep the chosen value visible while the popup handles search, grouping, and keyboard
            navigation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="grid gap-5 border-t py-8 first:border-0 first:pt-0 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{number}</p>
        <h2 className="mt-2 font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  )
}

export default function DesignSystemPage() {
  return (
    <PageLayout
      sidebar={<WorkspaceSidebar />}
      breadcrumbs={<PageBreadcrumbs />}
      title="NETIX design system"
      description="A compact, product-focused foundation built on the Nova style, Base UI primitives, and semantic tokens."
      actions={<Badge variant="secondary">Nova · Base UI · Tailwind v4</Badge>}
    >
      <div className="max-w-6xl">
        <Section
          number="01"
          title="Foundation"
          description="Neutral surfaces, a soft accent, and a high-contrast primary-2."
        >
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Background', 'bg-background'],
              ['Card', 'bg-card'],
              ['Muted', 'bg-muted'],
              ['Primary', 'bg-primary text-primary-foreground'],
              ['Accent', 'bg-accent text-accent-foreground'],
              ['Primary 2', 'bg-primary-2 text-primary-2-foreground'],
              ['Success', 'bg-success text-success-foreground'],
              ['Warning', 'bg-warning text-warning-foreground'],
              ['Destructive', 'bg-destructive text-destructive-foreground'],
            ].map(([name, color]) => (
              <div key={name} className="overflow-hidden rounded-xl bg-card">
                <div className={`h-16 ${color}`} />
                <p className="bg-card px-3 py-2 text-xs font-medium">{name}</p>
              </div>
            ))}
          </div>
          <Card className="mt-4">
            <CardContent className="grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-4xl font-semibold tracking-[-0.04em]">Display</p>
                <p className="mt-2 text-xs text-muted-foreground">32px · semibold</p>
              </div>
              <div>
                <p className="text-xl font-semibold tracking-tight">Section heading</p>
                <p className="mt-2 text-xs text-muted-foreground">20px · semibold</p>
              </div>
              <div>
                <p className="text-sm leading-6">
                  Body copy remains comfortable even when interface density increases.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">14px · regular</p>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section
          number="02"
          title="Actions"
          description="Use one primary action per context. Supporting actions remain quiet."
        >
          <Card>
            <CardContent className="flex flex-wrap items-center gap-3">
              <Button>
                <Plus className="size-4" /> Create project
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Delete</Button>
              <Button size="icon" aria-label="Notifications">
                <Bell className="size-4" />
              </Button>
              <Button loading>Saving</Button>
            </CardContent>
          </Card>
          <div className="mt-3 flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Neutral</Badge>
            <Badge variant="success">Healthy</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="destructive">Failed</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
        </Section>

        <Section
          number="03"
          title="Forms"
          description="Filled controls reduce visual noise while clear labels carry meaning."
        >
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Create workspace</CardTitle>
              <CardDescription>Set the defaults your team will start with.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="workspace-name">Workspace name</Label>
                  <Input id="workspace-name" placeholder="Acme operations" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label>Default role</Label>
                  <Select
                    defaultValue="viewer"
                    items={{ viewer: 'Viewer', editor: 'Editor', admin: 'Administrator' }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="viewer">Viewer</SelectItem>
                      <SelectItem value="editor">Editor</SelectItem>
                      <SelectItem value="admin">Administrator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Add any notes for your team…" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex items-start gap-3 rounded-xl bg-muted/70 p-3">
                  <Checkbox defaultChecked className="mt-0.5" />
                  <span>
                    <span className="block text-sm font-medium">Invite teammates</span>
                    <span className="block text-xs text-muted-foreground">
                      Send invitations after creation.
                    </span>
                  </span>
                </label>
                <div className="flex items-center justify-between rounded-xl bg-muted/70 p-3">
                  <div>
                    <p className="text-sm font-medium">Security digest</p>
                    <p className="text-xs text-muted-foreground">Weekly email summary</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <RadioGroup defaultValue="private" className="grid sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-xl bg-muted/70 p-3">
                  <RadioGroupItem value="private" />
                  <span className="text-sm font-medium">Private workspace</span>
                </label>
                <label className="flex items-center gap-3 rounded-xl bg-muted/70 p-3">
                  <RadioGroupItem value="organization" />
                  <span className="text-sm font-medium">Organization access</span>
                </label>
              </RadioGroup>
              <div className="flex justify-end gap-2">
                <Button variant="ghost">Cancel</Button>
                <Button>Create workspace</Button>
              </div>
            </CardContent>
          </Card>
        </Section>

        <Section
          number="04"
          title="Combobox"
          description="Searchable selection keeps long lists useful without sacrificing context or keyboard access."
        >
          <ComboboxShowcase />
        </Section>

        <Section
          number="05"
          title="Composition"
          description="Primitives become product patterns through restrained, reusable composition."
        >
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-3">
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { icon: Sparkles, title: 'Automation', value: '24 active' },
                  { icon: CreditCard, title: 'Monthly spend', value: '$2,450' },
                  { icon: Settings2, title: 'Configured apps', value: '18 connected' },
                ].map(({ icon: Icon, title, value }) => (
                  <Card key={title}>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="grid size-9 place-items-center rounded-xl bg-muted">
                          <Icon className="size-4" />
                        </span>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                      <p className="mt-5 text-sm text-muted-foreground">{title}</p>
                      <p className="mt-1 text-xl font-semibold">{value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="activity" className="mt-3">
              <Card>
                <CardContent className="text-sm text-muted-foreground">
                  Activity content follows the same surface and spacing rules.
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="mt-3">
              <Card>
                <CardContent className="text-sm text-muted-foreground">
                  Settings content follows the shared settings-panel recipe.
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <Separator className="my-5" />
          <div className="flex flex-wrap gap-2">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>
                Open example dialog
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm workspace</DialogTitle>
                  <DialogDescription>
                    Review the details before making this workspace available to your team.
                  </DialogDescription>
                </DialogHeader>
                <div className="rounded-lg bg-muted/50 p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-8 place-items-center rounded-full bg-background">
                      <Check className="size-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium">NETIX workspace</p>
                      <p className="text-xs text-muted-foreground">12 members · Private</p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose render={<Button variant="ghost" />}>Cancel</DialogClose>
                  <Button>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger render={<Button variant="outline" />}>Open example sheet</SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Workspace details</SheetTitle>
                  <SheetDescription>
                    Review ownership, members, and workspace defaults.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 px-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="sheet-workspace-name">Workspace name</Label>
                    <Input id="sheet-workspace-name" defaultValue="NETIX workspace" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                    <div>
                      <p className="text-sm font-medium">Member invitations</p>
                      <p className="text-xs text-muted-foreground">
                        Allow members to invite others
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
                <SheetFooter>
                  <Button>Save changes</Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </Section>

        <Section
          number="06"
          title="Usage rules"
          description="A small set of constraints keeps product teams from drifting."
        >
          <Card>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              {[
                [
                  'Semantic by default',
                  'Use token-based color and built-in variants instead of local color overrides.',
                ],
                [
                  'Compose, don’t fork',
                  'Build settings, tables, and dialogs from named primitives and composites.',
                ],
                [
                  'Density with hierarchy',
                  'Nova is compact, but important content still needs breathing room and clear grouping.',
                ],
                [
                  'Accessible interaction',
                  'Every interactive element needs a label, visible focus, and a non-color state cue.',
                ],
              ].map(([title, description]) => (
                <div key={title} className="flex gap-3">
                  <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{title}</p>
                    <p className="mt-1 text-sm leading-5 text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>
      </div>
    </PageLayout>
  )
}

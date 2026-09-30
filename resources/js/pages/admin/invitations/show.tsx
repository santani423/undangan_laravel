import InvitationEditor, { type InvitationEditorData } from '@/components/invitations/invitation-editor';
import AdminLayout from '@/layouts/admin-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ExternalLink, ShieldCheck, UserRound } from 'lucide-react';

interface AdminMeta {
    invitation_code: string | null;
    /** Null when the invitation has no slug — nothing to preview. */
    preview_url: string | null;
    is_expired: boolean;
    created_at: string | null;
    updated_at: string | null;
    expires_at: string | null;
    customer: { id: number; name: string; email: string } | null;
}

type Props = InvitationEditorData & { adminMeta: AdminMeta };

function formatDateTime(value: string | null): string {
    if (!value) return '-';

    return new Date(value).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function InfoItem({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <div className="mt-0.5 truncate text-sm text-foreground">{children}</div>
        </div>
    );
}

function AdminInfoPanel({ data, meta }: { data: InvitationEditorData; meta: AdminMeta }) {
    const { invitation, eventType, theme } = data;

    return (
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <ShieldCheck className="size-4 text-primary" />
                    Informasi Undangan
                </h2>
                {meta.preview_url ? (
                    <a
                        href={meta.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                        <ExternalLink className="size-3.5" />
                        Preview Undangan
                    </a>
                ) : (
                    <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <AlertTriangle className="size-3.5 text-amber-500" />
                        Slug undangan belum tersedia. Preview belum dapat dibuka.
                    </p>
                )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <InfoItem label="Customer">
                    {meta.customer ? (
                        <Link href={route('admin.users.show', meta.customer.id)} className="inline-flex items-center gap-1 hover:text-primary hover:underline">
                            <UserRound className="size-3.5 shrink-0" />
                            {meta.customer.name}
                        </Link>
                    ) : (
                        '-'
                    )}
                    {meta.customer && <p className="truncate text-xs text-muted-foreground">{meta.customer.email}</p>}
                </InfoItem>
                <InfoItem label="Tipe">
                    {eventType.label}
                    <p className="font-mono text-xs text-muted-foreground">{eventType.name}</p>
                </InfoItem>
                <InfoItem label="Tema">{theme?.name ?? '-'}</InfoItem>
                <InfoItem label="Status">
                    {invitation.status}
                    {meta.is_expired && <span className="ml-1.5 text-xs text-red-600">(kadaluarsa — preview publik tidak tersedia)</span>}
                </InfoItem>
                <InfoItem label="Slug">
                    <span className="font-mono">{invitation.slug || '-'}</span>
                </InfoItem>
                <InfoItem label="Kode Undangan">
                    <span className="font-mono">{meta.invitation_code ?? '-'}</span>
                </InfoItem>
                <InfoItem label="Dibuat">{formatDateTime(meta.created_at)}</InfoItem>
                <InfoItem label="Diperbarui">{formatDateTime(meta.updated_at)}</InfoItem>
            </div>
        </div>
    );
}

export default function AdminInvitationShow({ adminMeta, ...data }: Props) {
    const { invitation, eventType } = data;

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard Admin', href: '/admin' },
        ...(adminMeta.customer
            ? [{ title: adminMeta.customer.name, href: route('admin.users.show', adminMeta.customer.id) }]
            : [{ title: 'Undangan', href: '/admin/invitations' }]),
        { title: invitation.title, href: route('admin.invitations.show', invitation.id) },
    ];

    return (
        <AdminLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Undangan ${eventType.label} — ${invitation.title}`} />
            <InvitationEditor
                {...data}
                back={
                    adminMeta.customer
                        ? { href: route('admin.users.show', adminMeta.customer.id), label: `Kembali ke ${adminMeta.customer.name}` }
                        : { href: '/admin/invitations', label: 'Semua Undangan' }
                }
                endpoints={{
                    update:      route('admin.invitations.update', invitation.id),
                    theme:       route('admin.invitations.update-theme', invitation.id),
                    settings:    route('admin.invitations.update-settings', invitation.id),
                    uploadMusic: route('admin.invitations.upload-music', invitation.id),
                    checkSlug:   route('admin.invitations.check-slug'),
                }}
                headerExtra={<AdminInfoPanel data={data} meta={adminMeta} />}
            />
        </AdminLayout>
    );
}

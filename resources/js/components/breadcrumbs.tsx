import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { Fragment } from 'react';

export function Breadcrumbs({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
    return (
        <>
            {breadcrumbs.length > 0 && (
                <Breadcrumb className="min-w-0">
                    <BreadcrumbList className="flex-nowrap">
                        {breadcrumbs.map((item, index) => {
                            const isLast = index === breadcrumbs.length - 1;
                            return (
                                <Fragment key={index}>
                                    <BreadcrumbItem className={isLast ? 'min-w-0' : 'shrink-0'}>
                                        {isLast ? (
                                            <BreadcrumbPage className="inline-block max-w-[40vw] truncate align-bottom sm:max-w-xs">{item.title}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={item.href} className="whitespace-nowrap">{item.title}</BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                    {!isLast && <BreadcrumbSeparator className="shrink-0" />}
                                </Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>
            )}
        </>
    );
}

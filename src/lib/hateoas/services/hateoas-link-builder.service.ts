import { HateoasLink, HateoasLinkConfig, PaginationConfig } from '../types/hateoas.types';

/**
 * HATEOAS Link Builder Service
 * Generates hypermedia links for REST API responses
 */
export class HateoasLinkBuilder {
  /**
   * Builds pagination links for paginated resources
   */
  static buildPaginationLinks(config: HateoasLinkConfig, pagination: PaginationConfig): HateoasLink[] {
    const { baseUrl } = config;
    const { currentPage, itemsPerPage, totalItems } = pagination;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const links: HateoasLink[] = [];

    // Self link
    links.push({
      href: `${baseUrl}?page=${currentPage}&limit=${itemsPerPage}`,
      method: 'GET',
      rel: 'self',
      title: 'Current page',
    });

    // First page link
    if (currentPage > 1) {
      links.push({
        href: `${baseUrl}?page=1&limit=${itemsPerPage}`,
        method: 'GET',
        rel: 'first',
        title: 'First page',
      });
    }

    // Previous page link
    if (currentPage > 1) {
      links.push({
        href: `${baseUrl}?page=${currentPage - 1}&limit=${itemsPerPage}`,
        method: 'GET',
        rel: 'prev',
        title: 'Previous page',
      });
    }

    // Next page link
    if (currentPage < totalPages) {
      links.push({
        href: `${baseUrl}?page=${currentPage + 1}&limit=${itemsPerPage}`,
        method: 'GET',
        rel: 'next',
        title: 'Next page',
      });
    }

    // Last page link
    if (currentPage < totalPages) {
      links.push({
        href: `${baseUrl}?page=${totalPages}&limit=${itemsPerPage}`,
        method: 'GET',
        rel: 'last',
        title: 'Last page',
      });
    }

    return links;
  }

  /**
   * Builds resource-specific links (individual items, create, etc.)
   */
  static buildResourceLinks<T>(data: T[], config: HateoasLinkConfig): HateoasLink[] {
    const links: HateoasLink[] = [];
    const { baseUrl, includeResourceLinks = true, includeCreateLink = true, resourceIdSelector } = config;

    // Individual resource links
    if (includeResourceLinks && data.length > 0) {
      data.forEach((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const id = resourceIdSelector ? resourceIdSelector(item) : (item as any).id;
        if (id !== undefined) {
          links.push({
            href: `${baseUrl}/${id}`,
            method: 'GET',
            rel: 'item',
            title: `Get ${baseUrl.split('/').pop()?.slice(0, -1)} ${id}`,
          });
        }
      });
    }

    // Create new resource link
    if (includeCreateLink) {
      links.push({
        href: baseUrl,
        method: 'POST',
        rel: 'create',
        title: `Create new ${baseUrl.split('/').pop()?.slice(0, -1)}`,
      });
    }

    // Add custom links
    if (config.customLinks) {
      links.push(...config.customLinks);
    }

    return links;
  }

  /**
   * Builds all links (pagination + resource links)
   */
  static buildAllLinks<T>(data: T[], config: HateoasLinkConfig, pagination: PaginationConfig): HateoasLink[] {
    const paginationLinks = this.buildPaginationLinks(config, pagination);
    const resourceLinks = this.buildResourceLinks(data, config);

    return [...paginationLinks, ...resourceLinks];
  }
}

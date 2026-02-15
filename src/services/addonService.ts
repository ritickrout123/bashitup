import { Addon, APIResponse } from '@/types';

export class AddonService {
    private static baseUrl = '/api/addons';

    /**
     * Get all available addons
     */
    static async getAddons(): Promise<Addon[]> {
        try {
            const response = await fetch(this.baseUrl);
            const result: APIResponse<Addon[]> = await response.json();

            if (!result.success) {
                throw new Error(result.error?.message || 'Failed to fetch addons');
            }

            return result.data || [];
        } catch (error) {
            console.error('Error fetching addons:', error);
            // Fallback to empty array to prevent breaking the UI
            return [];
        }
    }

    /**
     * Get addons by category
     */
    static async getAddonsByCategory(category: string): Promise<Addon[]> {
        const allAddons = await this.getAddons();
        return allAddons.filter(addon => addon.category === category);
    }
}

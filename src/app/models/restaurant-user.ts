import { Address } from './address';

export class RestaurantUser {
  constructor(
    public restaurantId: string,
    public name: string,
    public address: Address,
    public email: string,
    public phone: string,
    public placeId: string,
    public website?: string
  ) {}
}

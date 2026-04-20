import { db } from '../db';
import { carts, cartItems, courses, users } from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import type { CartDto, CartItemDto, CartItemType } from '../../shared/schema';

export class CartStorage {
  async getOrCreateCart(userId: string): Promise<CartDto> {
    const existingCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, userId))
      .limit(1);

    let cart;
    if (existingCart.length === 0) {
      const newCarts = await db
        .insert(carts)
        .values({ userId })
        .returning();
      cart = newCarts[0];
    } else {
      cart = existingCart[0];
    }

    return this.getCartWithItems(cart.id);
  }

  async getCartWithItems(cartId: string): Promise<CartDto> {
    const cart = await db
      .select()
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);

    if (!cart || cart.length === 0) {
      throw new Error('Cart not found');
    }

    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId));

    const itemsWithDetails: CartItemDto[] = [];
    let totalPrice = 0;

    for (const item of items) {
      if (item.itemType === 'course') {
        const courseData = await db
          .select({
            id: courses.id,
            title: courses.title,
            price: courses.price,
            imageUrl: courses.imageUrl,
            instructorId: courses.instructorId,
          })
          .from(courses)
          .where(eq(courses.id, item.itemId))
          .limit(1);

        if (courseData.length > 0) {
          const course = courseData[0];
          
          const instructor = await db
            .select()
            .from(users)
            .where(eq(users.id, course.instructorId))
            .limit(1);

          const instructorName = instructor[0]
            ? `${instructor[0].firstName || ''} ${instructor[0].lastName || ''}`.trim() || instructor[0].email || 'Unknown'
            : 'Unknown';

          const priceInCents = course.price || 0;
          const priceInDollars = priceInCents / 100;

          itemsWithDetails.push({
            id: item.id,
            itemType: item.itemType,
            itemId: item.itemId,
            quantity: item.quantity,
            addedAt: item.addedAt,
            course: {
              id: course.id,
              title: course.title,
              price: priceInDollars,
              imageUrl: course.imageUrl || '',
              instructorName,
            },
          });

          totalPrice += priceInDollars * item.quantity;
        }
      }
    }

    return {
      id: cart[0].id,
      userId: cart[0].userId,
      items: itemsWithDetails,
      totalItems: items.length,
      totalPrice,
      createdAt: cart[0].createdAt,
      updatedAt: cart[0].updatedAt,
    };
  }

  async addToCart(userId: string, itemType: CartItemType, itemId: string, quantity: number = 1): Promise<CartDto> {
    const cartData = await this.getOrCreateCart(userId);

    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartData.id),
          eq(cartItems.itemType, itemType),
          eq(cartItems.itemId, itemId)
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      await db
        .update(cartItems)
        .set({ quantity: existingItem[0].quantity + quantity })
        .where(eq(cartItems.id, existingItem[0].id));
    } else {
      await db
        .insert(cartItems)
        .values({
          cartId: cartData.id,
          itemType,
          itemId,
          quantity,
        });
    }

    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartData.id));

    return this.getCartWithItems(cartData.id);
  }

  async removeFromCart(userId: string, itemId: string): Promise<CartDto> {
    const cartData = await this.getOrCreateCart(userId);

    await db
      .delete(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cartData.id),
          eq(cartItems.id, itemId)
        )
      );

    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartData.id));

    return this.getCartWithItems(cartData.id);
  }

  async updateCartItemQuantity(userId: string, itemId: string, quantity: number): Promise<CartDto> {
    const cartData = await this.getOrCreateCart(userId);

    if (quantity === 0) {
      return this.removeFromCart(userId, itemId);
    }

    await db
      .update(cartItems)
      .set({ quantity })
      .where(
        and(
          eq(cartItems.cartId, cartData.id),
          eq(cartItems.id, itemId)
        )
      );

    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartData.id));

    return this.getCartWithItems(cartData.id);
  }

  async clearCart(userId: string): Promise<void> {
    const cartData = await this.getOrCreateCart(userId);

    await db
      .delete(cartItems)
      .where(eq(cartItems.cartId, cartData.id));

    await db
      .update(carts)
      .set({ updatedAt: new Date() })
      .where(eq(carts.id, cartData.id));
  }

  async getCartItemCount(userId: string): Promise<number> {
    const cartData = await this.getOrCreateCart(userId);

    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, cartData.id));

    return items.length;
  }
}

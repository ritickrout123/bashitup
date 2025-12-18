import { PaymentService } from '@/services/paymentService';

describe('PaymentService', () => {
  describe('calculateTokenAmount', () => {
    it('should calculate 20% token amount', () => {
      expect(PaymentService.calculateTokenAmount(5000)).toBe(1000);
      expect(PaymentService.calculateTokenAmount(10000)).toBe(2000);
    });

    it('should enforce minimum token amount of ₹500', () => {
      expect(PaymentService.calculateTokenAmount(1000)).toBe(500);
      expect(PaymentService.calculateTokenAmount(2000)).toBe(500);
    });

    it('should enforce maximum token amount of ₹2000', () => {
      expect(PaymentService.calculateTokenAmount(15000)).toBe(2000);
      expect(PaymentService.calculateTokenAmount(20000)).toBe(2000);
    });
  });

  describe('formatAmount', () => {
    it('should format amount in Indian currency', () => {
      expect(PaymentService.formatAmount(1000)).toBe('₹1,000');
      expect(PaymentService.formatAmount(50000)).toBe('₹50,000');
    });
  });
});
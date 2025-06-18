/**
 * PayPal类型声明
 */

// 扩展全局Window接口
interface Window {
  paypal: PayPalNamespace;
}

// PayPal命名空间
interface PayPalNamespace {
  Buttons: (options: PayPalButtonsOptions) => PayPalButtonsComponent;
}

// PayPal按钮选项
interface PayPalButtonsOptions {
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay' | 'installment' | 'subscribe';
    height?: number;
    tagline?: boolean;
  };
  createSubscription?: (data: any, actions: any) => Promise<string>;
  onApprove?: (data: any, actions?: any) => void | Promise<void>;
  onCancel?: (data: any) => void;
  onError?: (err: any) => void;
}

// PayPal按钮组件
interface PayPalButtonsComponent {
  render: (selector: string) => void;
  close: () => void;
}

export {};


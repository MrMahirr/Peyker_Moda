export type AddressType = "home" | "work";

export interface Address {
  id: string;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  postalCode: string;
  isDefault: boolean;
  type: AddressType;
}

export type AddressFormData = Omit<Address, "id" | "isDefault">;

export const EMPTY_ADDRESS_FORM: AddressFormData = {
  title: "",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  district: "",
  postalCode: "",
  type: "home",
};

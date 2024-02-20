// This function can be used to get an identifying xpub at the keypath m/4541509'/1112098098'"
// The keypath argument has to be m/4541509'/1112098098'

// Code generated by protoc-gen-go. DO NOT EDIT.
// versions:
// 	protoc-gen-go v1.30.0
// 	protoc        v3.21.12
// source: keystore.proto

package messages

import (
	protoreflect "google.golang.org/protobuf/reflect/protoreflect"
	protoimpl "google.golang.org/protobuf/runtime/protoimpl"
	emptypb "google.golang.org/protobuf/types/known/emptypb"
	reflect "reflect"
	sync "sync"
)

const (
	// Verify that this generated code is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(20 - protoimpl.MinVersion)
	// Verify that runtime/protoimpl is sufficiently up-to-date.
	_ = protoimpl.EnforceVersion(protoimpl.MaxVersion - 20)
)

type ElectrumEncryptionKeyRequest struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Keypath []uint32 `protobuf:"varint,1,rep,packed,name=keypath,proto3" json:"keypath,omitempty"`
}

func (x *ElectrumEncryptionKeyRequest) Reset() {
	*x = ElectrumEncryptionKeyRequest{}
	if protoimpl.UnsafeEnabled {
		mi := &file_keystore_proto_msgTypes[0]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ElectrumEncryptionKeyRequest) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ElectrumEncryptionKeyRequest) ProtoMessage() {}

func (x *ElectrumEncryptionKeyRequest) ProtoReflect() protoreflect.Message {
	mi := &file_keystore_proto_msgTypes[0]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ElectrumEncryptionKeyRequest.ProtoReflect.Descriptor instead.
func (*ElectrumEncryptionKeyRequest) Descriptor() ([]byte, []int) {
	return file_keystore_proto_rawDescGZIP(), []int{0}
}

func (x *ElectrumEncryptionKeyRequest) GetKeypath() []uint32 {
	if x != nil {
		return x.Keypath
	}
	return nil
}

type ElectrumEncryptionKeyResponse struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	Key string `protobuf:"bytes,1,opt,name=key,proto3" json:"key,omitempty"`
}

func (x *ElectrumEncryptionKeyResponse) Reset() {
	*x = ElectrumEncryptionKeyResponse{}
	if protoimpl.UnsafeEnabled {
		mi := &file_keystore_proto_msgTypes[1]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *ElectrumEncryptionKeyResponse) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*ElectrumEncryptionKeyResponse) ProtoMessage() {}

func (x *ElectrumEncryptionKeyResponse) ProtoReflect() protoreflect.Message {
	mi := &file_keystore_proto_msgTypes[1]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use ElectrumEncryptionKeyResponse.ProtoReflect.Descriptor instead.
func (*ElectrumEncryptionKeyResponse) Descriptor() ([]byte, []int) {
	return file_keystore_proto_rawDescGZIP(), []int{1}
}

func (x *ElectrumEncryptionKeyResponse) GetKey() string {
	if x != nil {
		return x.Key
	}
	return ""
}

type BIP85Request struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Types that are assignable to App:
	//
	//	*BIP85Request_Bip39
	//	*BIP85Request_Ln
	App isBIP85Request_App `protobuf_oneof:"app"`
}

func (x *BIP85Request) Reset() {
	*x = BIP85Request{}
	if protoimpl.UnsafeEnabled {
		mi := &file_keystore_proto_msgTypes[2]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *BIP85Request) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*BIP85Request) ProtoMessage() {}

func (x *BIP85Request) ProtoReflect() protoreflect.Message {
	mi := &file_keystore_proto_msgTypes[2]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use BIP85Request.ProtoReflect.Descriptor instead.
func (*BIP85Request) Descriptor() ([]byte, []int) {
	return file_keystore_proto_rawDescGZIP(), []int{2}
}

func (m *BIP85Request) GetApp() isBIP85Request_App {
	if m != nil {
		return m.App
	}
	return nil
}

func (x *BIP85Request) GetBip39() *emptypb.Empty {
	if x, ok := x.GetApp().(*BIP85Request_Bip39); ok {
		return x.Bip39
	}
	return nil
}

func (x *BIP85Request) GetLn() *BIP85Request_AppLn {
	if x, ok := x.GetApp().(*BIP85Request_Ln); ok {
		return x.Ln
	}
	return nil
}

type isBIP85Request_App interface {
	isBIP85Request_App()
}

type BIP85Request_Bip39 struct {
	Bip39 *emptypb.Empty `protobuf:"bytes,1,opt,name=bip39,proto3,oneof"`
}

type BIP85Request_Ln struct {
	Ln *BIP85Request_AppLn `protobuf:"bytes,2,opt,name=ln,proto3,oneof"`
}

func (*BIP85Request_Bip39) isBIP85Request_App() {}

func (*BIP85Request_Ln) isBIP85Request_App() {}

type BIP85Response struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	// Types that are assignable to App:
	//
	//	*BIP85Response_Bip39
	//	*BIP85Response_Ln
	App isBIP85Response_App `protobuf_oneof:"app"`
}

func (x *BIP85Response) Reset() {
	*x = BIP85Response{}
	if protoimpl.UnsafeEnabled {
		mi := &file_keystore_proto_msgTypes[3]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *BIP85Response) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*BIP85Response) ProtoMessage() {}

func (x *BIP85Response) ProtoReflect() protoreflect.Message {
	mi := &file_keystore_proto_msgTypes[3]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use BIP85Response.ProtoReflect.Descriptor instead.
func (*BIP85Response) Descriptor() ([]byte, []int) {
	return file_keystore_proto_rawDescGZIP(), []int{3}
}

func (m *BIP85Response) GetApp() isBIP85Response_App {
	if m != nil {
		return m.App
	}
	return nil
}

func (x *BIP85Response) GetBip39() *emptypb.Empty {
	if x, ok := x.GetApp().(*BIP85Response_Bip39); ok {
		return x.Bip39
	}
	return nil
}

func (x *BIP85Response) GetLn() []byte {
	if x, ok := x.GetApp().(*BIP85Response_Ln); ok {
		return x.Ln
	}
	return nil
}

type isBIP85Response_App interface {
	isBIP85Response_App()
}

type BIP85Response_Bip39 struct {
	Bip39 *emptypb.Empty `protobuf:"bytes,1,opt,name=bip39,proto3,oneof"`
}

type BIP85Response_Ln struct {
	Ln []byte `protobuf:"bytes,2,opt,name=ln,proto3,oneof"`
}

func (*BIP85Response_Bip39) isBIP85Response_App() {}

func (*BIP85Response_Ln) isBIP85Response_App() {}

type BIP85Request_AppLn struct {
	state         protoimpl.MessageState
	sizeCache     protoimpl.SizeCache
	unknownFields protoimpl.UnknownFields

	AccountNumber uint32 `protobuf:"varint,1,opt,name=account_number,json=accountNumber,proto3" json:"account_number,omitempty"`
}

func (x *BIP85Request_AppLn) Reset() {
	*x = BIP85Request_AppLn{}
	if protoimpl.UnsafeEnabled {
		mi := &file_keystore_proto_msgTypes[4]
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		ms.StoreMessageInfo(mi)
	}
}

func (x *BIP85Request_AppLn) String() string {
	return protoimpl.X.MessageStringOf(x)
}

func (*BIP85Request_AppLn) ProtoMessage() {}

func (x *BIP85Request_AppLn) ProtoReflect() protoreflect.Message {
	mi := &file_keystore_proto_msgTypes[4]
	if protoimpl.UnsafeEnabled && x != nil {
		ms := protoimpl.X.MessageStateOf(protoimpl.Pointer(x))
		if ms.LoadMessageInfo() == nil {
			ms.StoreMessageInfo(mi)
		}
		return ms
	}
	return mi.MessageOf(x)
}

// Deprecated: Use BIP85Request_AppLn.ProtoReflect.Descriptor instead.
func (*BIP85Request_AppLn) Descriptor() ([]byte, []int) {
	return file_keystore_proto_rawDescGZIP(), []int{2, 0}
}

func (x *BIP85Request_AppLn) GetAccountNumber() uint32 {
	if x != nil {
		return x.AccountNumber
	}
	return 0
}

var File_keystore_proto protoreflect.FileDescriptor

var file_keystore_proto_rawDesc = []byte{
	0x0a, 0x0e, 0x6b, 0x65, 0x79, 0x73, 0x74, 0x6f, 0x72, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f,
	0x12, 0x14, 0x73, 0x68, 0x69, 0x66, 0x74, 0x63, 0x72, 0x79, 0x70, 0x74, 0x6f, 0x2e, 0x62, 0x69,
	0x74, 0x62, 0x6f, 0x78, 0x30, 0x32, 0x1a, 0x1b, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2f, 0x70,
	0x72, 0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2f, 0x65, 0x6d, 0x70, 0x74, 0x79, 0x2e, 0x70, 0x72,
	0x6f, 0x74, 0x6f, 0x22, 0x38, 0x0a, 0x1c, 0x45, 0x6c, 0x65, 0x63, 0x74, 0x72, 0x75, 0x6d, 0x45,
	0x6e, 0x63, 0x72, 0x79, 0x70, 0x74, 0x69, 0x6f, 0x6e, 0x4b, 0x65, 0x79, 0x52, 0x65, 0x71, 0x75,
	0x65, 0x73, 0x74, 0x12, 0x18, 0x0a, 0x07, 0x6b, 0x65, 0x79, 0x70, 0x61, 0x74, 0x68, 0x18, 0x01,
	0x20, 0x03, 0x28, 0x0d, 0x52, 0x07, 0x6b, 0x65, 0x79, 0x70, 0x61, 0x74, 0x68, 0x22, 0x31, 0x0a,
	0x1d, 0x45, 0x6c, 0x65, 0x63, 0x74, 0x72, 0x75, 0x6d, 0x45, 0x6e, 0x63, 0x72, 0x79, 0x70, 0x74,
	0x69, 0x6f, 0x6e, 0x4b, 0x65, 0x79, 0x52, 0x65, 0x73, 0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x10,
	0x0a, 0x03, 0x6b, 0x65, 0x79, 0x18, 0x01, 0x20, 0x01, 0x28, 0x09, 0x52, 0x03, 0x6b, 0x65, 0x79,
	0x22, 0xb1, 0x01, 0x0a, 0x0c, 0x42, 0x49, 0x50, 0x38, 0x35, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73,
	0x74, 0x12, 0x2e, 0x0a, 0x05, 0x62, 0x69, 0x70, 0x33, 0x39, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0b,
	0x32, 0x16, 0x2e, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2e, 0x70, 0x72, 0x6f, 0x74, 0x6f, 0x62,
	0x75, 0x66, 0x2e, 0x45, 0x6d, 0x70, 0x74, 0x79, 0x48, 0x00, 0x52, 0x05, 0x62, 0x69, 0x70, 0x33,
	0x39, 0x12, 0x3a, 0x0a, 0x02, 0x6c, 0x6e, 0x18, 0x02, 0x20, 0x01, 0x28, 0x0b, 0x32, 0x28, 0x2e,
	0x73, 0x68, 0x69, 0x66, 0x74, 0x63, 0x72, 0x79, 0x70, 0x74, 0x6f, 0x2e, 0x62, 0x69, 0x74, 0x62,
	0x6f, 0x78, 0x30, 0x32, 0x2e, 0x42, 0x49, 0x50, 0x38, 0x35, 0x52, 0x65, 0x71, 0x75, 0x65, 0x73,
	0x74, 0x2e, 0x41, 0x70, 0x70, 0x4c, 0x6e, 0x48, 0x00, 0x52, 0x02, 0x6c, 0x6e, 0x1a, 0x2e, 0x0a,
	0x05, 0x41, 0x70, 0x70, 0x4c, 0x6e, 0x12, 0x25, 0x0a, 0x0e, 0x61, 0x63, 0x63, 0x6f, 0x75, 0x6e,
	0x74, 0x5f, 0x6e, 0x75, 0x6d, 0x62, 0x65, 0x72, 0x18, 0x01, 0x20, 0x01, 0x28, 0x0d, 0x52, 0x0d,
	0x61, 0x63, 0x63, 0x6f, 0x75, 0x6e, 0x74, 0x4e, 0x75, 0x6d, 0x62, 0x65, 0x72, 0x42, 0x05, 0x0a,
	0x03, 0x61, 0x70, 0x70, 0x22, 0x58, 0x0a, 0x0d, 0x42, 0x49, 0x50, 0x38, 0x35, 0x52, 0x65, 0x73,
	0x70, 0x6f, 0x6e, 0x73, 0x65, 0x12, 0x2e, 0x0a, 0x05, 0x62, 0x69, 0x70, 0x33, 0x39, 0x18, 0x01,
	0x20, 0x01, 0x28, 0x0b, 0x32, 0x16, 0x2e, 0x67, 0x6f, 0x6f, 0x67, 0x6c, 0x65, 0x2e, 0x70, 0x72,
	0x6f, 0x74, 0x6f, 0x62, 0x75, 0x66, 0x2e, 0x45, 0x6d, 0x70, 0x74, 0x79, 0x48, 0x00, 0x52, 0x05,
	0x62, 0x69, 0x70, 0x33, 0x39, 0x12, 0x10, 0x0a, 0x02, 0x6c, 0x6e, 0x18, 0x02, 0x20, 0x01, 0x28,
	0x0c, 0x48, 0x00, 0x52, 0x02, 0x6c, 0x6e, 0x42, 0x05, 0x0a, 0x03, 0x61, 0x70, 0x70, 0x62, 0x06,
	0x70, 0x72, 0x6f, 0x74, 0x6f, 0x33,
}

var (
	file_keystore_proto_rawDescOnce sync.Once
	file_keystore_proto_rawDescData = file_keystore_proto_rawDesc
)

func file_keystore_proto_rawDescGZIP() []byte {
	file_keystore_proto_rawDescOnce.Do(func() {
		file_keystore_proto_rawDescData = protoimpl.X.CompressGZIP(file_keystore_proto_rawDescData)
	})
	return file_keystore_proto_rawDescData
}

var file_keystore_proto_msgTypes = make([]protoimpl.MessageInfo, 5)
var file_keystore_proto_goTypes = []interface{}{
	(*ElectrumEncryptionKeyRequest)(nil),  // 0: shiftcrypto.bitbox02.ElectrumEncryptionKeyRequest
	(*ElectrumEncryptionKeyResponse)(nil), // 1: shiftcrypto.bitbox02.ElectrumEncryptionKeyResponse
	(*BIP85Request)(nil),                  // 2: shiftcrypto.bitbox02.BIP85Request
	(*BIP85Response)(nil),                 // 3: shiftcrypto.bitbox02.BIP85Response
	(*BIP85Request_AppLn)(nil),            // 4: shiftcrypto.bitbox02.BIP85Request.AppLn
	(*emptypb.Empty)(nil),                 // 5: google.protobuf.Empty
}
var file_keystore_proto_depIdxs = []int32{
	5, // 0: shiftcrypto.bitbox02.BIP85Request.bip39:type_name -> google.protobuf.Empty
	4, // 1: shiftcrypto.bitbox02.BIP85Request.ln:type_name -> shiftcrypto.bitbox02.BIP85Request.AppLn
	5, // 2: shiftcrypto.bitbox02.BIP85Response.bip39:type_name -> google.protobuf.Empty
	3, // [3:3] is the sub-list for method output_type
	3, // [3:3] is the sub-list for method input_type
	3, // [3:3] is the sub-list for extension type_name
	3, // [3:3] is the sub-list for extension extendee
	0, // [0:3] is the sub-list for field type_name
}

func init() { file_keystore_proto_init() }
func file_keystore_proto_init() {
	if File_keystore_proto != nil {
		return
	}
	if !protoimpl.UnsafeEnabled {
		file_keystore_proto_msgTypes[0].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ElectrumEncryptionKeyRequest); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_keystore_proto_msgTypes[1].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*ElectrumEncryptionKeyResponse); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_keystore_proto_msgTypes[2].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*BIP85Request); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_keystore_proto_msgTypes[3].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*BIP85Response); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
		file_keystore_proto_msgTypes[4].Exporter = func(v interface{}, i int) interface{} {
			switch v := v.(*BIP85Request_AppLn); i {
			case 0:
				return &v.state
			case 1:
				return &v.sizeCache
			case 2:
				return &v.unknownFields
			default:
				return nil
			}
		}
	}
	file_keystore_proto_msgTypes[2].OneofWrappers = []interface{}{
		(*BIP85Request_Bip39)(nil),
		(*BIP85Request_Ln)(nil),
	}
	file_keystore_proto_msgTypes[3].OneofWrappers = []interface{}{
		(*BIP85Response_Bip39)(nil),
		(*BIP85Response_Ln)(nil),
	}
	type x struct{}
	out := protoimpl.TypeBuilder{
		File: protoimpl.DescBuilder{
			GoPackagePath: reflect.TypeOf(x{}).PkgPath(),
			RawDescriptor: file_keystore_proto_rawDesc,
			NumEnums:      0,
			NumMessages:   5,
			NumExtensions: 0,
			NumServices:   0,
		},
		GoTypes:           file_keystore_proto_goTypes,
		DependencyIndexes: file_keystore_proto_depIdxs,
		MessageInfos:      file_keystore_proto_msgTypes,
	}.Build()
	File_keystore_proto = out.File
	file_keystore_proto_rawDesc = nil
	file_keystore_proto_goTypes = nil
	file_keystore_proto_depIdxs = nil
}

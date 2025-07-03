// import { LucideProps } from 'lucide-react'
// import { ForwardRefExoticComponent, RefAttributes } from 'react'

// export const REC_PER_PAGE = 10

// export const INVITE_STATUS: Record<string, { status: string; color: string }> =
//   {
//     pending: { status: 'Pendente', color: 'bg-yellow-100 text-yellow-600' },
//     accepted: { status: 'Aceito', color: ' bg-green-100 text-green-700 ' },
//     revoked: { status: 'Revogado', color: 'bg-red-100 text-red-600' },
//   }

// export const USER_ROLES = ['admin', 'community-manager', 'editor', 'student']
// export type STREAMING_STATUS = 'idle' | 'processing' | 'streaming'

// export type UploadthingEndpoints =
//   | 'uploader'
//   | 'thumbUploader'
//   | 'siteContentAssetsUploader'

// export type SupabaseStorageEndpoints =
//   | 'uploader'
//   | 'thumbUploader'
//   | 'siteContentAssetsUploader'

// export const SUBSCRIPTION_STATUS: Record<
//   string,
//   { label: string; color: string }
// > = {
//   active: { label: 'Ativa', color: 'text-green-600' },
//   past_due: { label: 'Atrasada', color: 'text-red-600' },
//   canceled: { label: 'Cancelada', color: 'text-neutral-600' },
//   trialing: { label: 'Em teste', color: 'text-blue-600' },
//   pending: { label: 'Pendente', color: 'text-yellow-600' },
// }
// export const PAYMENT_STATUS: Record<string, { label: string; color: string }> =
//   {
//     succeeded: { label: 'Confirmado', color: 'text-green-600' },
//     failed: { label: 'Falhou', color: 'text-red-600' },
//     pending: { label: 'Pendente', color: 'text-yellow-600' },
//   }

// export type PageParams = Promise<{
//   [key: string]: string | string[] | undefined
// }>

// export type BannerParams = {
//   className: string
//   textColor: string
//   icon: ForwardRefExoticComponent<
//     Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
//   >
//   iconClassName: string
// }

// export type User = {
//   id: string
//   email: string
//   firstName: string
//   lastName: string
//   role: string
//   imageUrl?: string
//   status?: boolean
//   createdAt?: Date
// }

// export type Community = {
//   id: string
//   name: string
//   slug: string
//   members: { email: string }[]
//   _count: { course: number }
// }

// export type CommunitySetup = {
//   id: string
//   name: string
//   content: string
//   contactInfo: string
//   imageKey: string
//   imageUrl: string
// }

// export type Invitation = {
//   id: string
//   email: string
//   name: string
//   status: 'pending' | 'accepted' | 'revoked'
//   communityId?: string
//   createdAt: Date
// }

// export type Course = {
//   id: string
//   title: string
//   description: string
//   plainSyllabus: string
//   mdSyllabus: string
//   imageKey: string
//   imageUrl: string
//   slug: string
//   tags: string[]
//   status: string
//   createdAt: Date
// }

// export type Lesson = {
//   id: string
//   courseId: string
//   title: string
//   slug: string
//   tags?: string[]
//   sectionTag?: string
//   plainContent?: string
//   mdContent: string
//   status?: string
//   createdAt?: Date
// }

// export type LessonAsset = {
//   lessonId: string
//   title: string
//   fileKey: string
//   fileName: string
//   fileType: string
// }

// export type VideoAsset = {
//   id: string
//   lessonId: string
//   uploadId: string
//   assetId: string | null
//   playbackId: string | null
//   status: string
//   aspectRatio: string | '16:9'
// }

// export type LessonRating = {
//   rating: number
// }
// export type StudentProgress = {
//   lastSeen: number
//   completed: boolean
// }

// export type ActionMenuItem = {
//   label: string
//   url: string
//   icon: ForwardRefExoticComponent<
//     Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>
//   >
// }

// export type InvitationListItem = {
//   id: string
//   invitationId: string
//   email: string
//   role?: 'admin' | 'community-manager' | 'editor' | 'student'
//   status?: 'pending' | 'accepted' | 'revoked'
//   communityId?: string
//   createdAt: Date
// }

// export type UserListItem = {
//   id: string
//   email: string
//   firstName: string
//   lastName: string
//   role: 'admin' | 'community-manager' | 'editor' | 'student'
//   status: boolean
//   createdAt: Date
// }
// export type ListItem = {
//   id: string
//   title: string
//   titleUrl: string
//   sectionTag?: string
//   description?: string
//   imageUrl?: string
//   status?: string
//   actions?: ActionMenuItem[]
// }

// export type LessonSlugProgressItem = {
//   id: string
//   title: string
//   slug: string
//   sectionTag: string
//   videoAsset: {
//     duration: number | 0
//   }
//   studentProgress: {
//     completed: boolean | false
//     lastSeen: number
//   }
// }

// export type LessonsByCourse = {
//   id: string
//   title: string
//   slug: string
//   lessons: LessonSlugProgressItem[]
// }

// export type Subscription = {
//   id: string
//   planName: string
//   planAmount: number
//   subInterval: string
//   subscriptionStatus: string
//   paymentStatus: string
//   currentPeriodEnd?: Date
// }

// export type CourseDashListItem = Pick<
//   Course,
//   'id' | 'title' | 'imageUrl' | 'status'
// >

// export type CourseLite = Pick<Course, 'id' | 'title'>
// export type CourseSlug = Pick<Course, 'id' | 'slug'>
// export type LessonLite = Pick<Lesson, 'id' | 'title' | 'sectionTag'>
// export type LessonLinkListItem = Pick<Lesson, 'id' | 'title' | 'slug'>
// export type VideoPlayerItem = {
//   courseSlug: CourseSlug
//   lessonId: string
//   lessonTitle: string
//   lessonPosition: number
//   playbackId: string
//   assetId: string
//   aspectRatio: string
// }

// export type CourseListItem = Pick<
//   Course,
//   'id' | 'title' | 'description' | 'imageUrl' | 'slug'
// >

// export type CardLiteItem = {
//   id: string
//   title: string
//   description?: string
//   showPlayIcon?: boolean
//   showDescription?: boolean
//   imageUrl: string
//   slug: string
// }

// export type SiteContent = {
//   id?: string
//   contentKey: string
//   plainData: string
//   data: string
//   extraInstructions?: string
//   deletedAssetKeys?: string[]
//   assetKeys?: string[]
// }

// export type TutorHistoryEntry = {
//   question: string
//   answer: string
//   lesson?: {
//     course: string
//     lesson: string
//     lessonTitle: string
//   }
// }

// /* Tanstack Form tests */

// // export const siteContentFormOpts = formOptions({
// //   defaultValues: {
// //     id: '',
// //     contentKey: '',
// //     plainData: '',
// //     data: '',
// //     extraInstructions: '',
// //     assetKeys: [],
// //   } as SiteContent,
// // })

// /* Action Parameters */

// export type GetNextLessonParams = {
//   userId: string
//   course: CourseSlug
//   pos: number
//   unseen: boolean
// }

// /* Site Content */

// export type PricingCardType = {
//   priceId: string
//   price: number
//   title: string
//   badgeText: string
//   recurrence: string
//   description: string
//   features: string[]
// }

// export type CarouselType = {
//   imageKey: string
//   text: string
//   url: string
// }

// export type InfoCardType = {
//   title: string
//   details: string
// }

// export const containerVariants = {
//   hidden: { opacity: 0, y: 50 },
//   visible: {
//     opacity: 1,
//     y: 0,
//     transition: {
//       duration: 0.5,
//       staggerChildren: 0.2,
//     },
//   },
// }
// export const itemVariants = {
//   hidden: { opacity: 0, y: 20 },
//   visible: { opacity: 1, y: 0 },
// }

// export type HeroType = {
//   imageKey: string
//   text: string
//   subText: string
//   url: string
// }

// export type FAQType = {
//   question: string
//   answer: string
// }

// export type TestimonialType = {
//   name: string
//   role: string
//   text: string
// }

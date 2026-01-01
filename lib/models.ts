import type { ObjectId } from "mongodb"

export interface Picture {
  id: string
  plantId: string
  userId: string
  src: string
  uploaded: Date // added uploaded date to Picture interface
}

export interface Plant {
  _id?: ObjectId
  id: string
  name: string
  userId: string
  planted: Date
  lastProofPicture?: Date // changed lastProofPicture from string to Date
  pictures: Picture[]
}

export interface User {
  _id?: ObjectId
  id: string
  fullName: string
  password: string
  created: Date
  house: string
  plants: string[]
  // plants array contains plant IDs for the relation
}

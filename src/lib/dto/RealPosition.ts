export default class RealPosition {
  constructor(
    public latitude: number,
    public longitude: number,
    public height: number | null = null,
  ) {}
}
